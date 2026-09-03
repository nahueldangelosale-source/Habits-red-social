import os
import hashlib
from tree_sitter import Language, Parser
import tree_sitter_python as tspython
from sqlalchemy.orm import Session
from app.infrastructure.dtg.storage import DTGNode, DTGEdge, dtg_session_maker
import structlog

logger = structlog.get_logger(__name__)

class DTGEngine:
    """
    Core Engine for Data Transformation Graph.
    Parses code using tree-sitter and persists the semantic map to Turso.
    """
    
    def __init__(self):
        # Initialize Tree-sitter for Python
        self.language = Language(tspython.language())
        self.parser = Parser(self.language)

    def _get_node_id(self, file_path: str, node_name: str, node_type: str) -> str:
        """Generates a stable ID for a node."""
        content = f"{file_path}:{node_type}:{node_name}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def scan_directory(self, directory_path: str):
        """Recursively scans a directory and updates the DTG."""
        logger.info("dtg_scan_start", path=directory_path)
        
        with dtg_session_maker() as session:
            for root, _, files in os.walk(directory_path):
                for file in files:
                    if file.endswith(".py") and not file.startswith("__"):
                        self._process_file(os.path.join(root, file), session)
            session.commit()

    def _process_file(self, file_path: str, session: Session):
        """Parses a single file and extracts structural nodes/edges."""
        with open(file_path, "rb") as f:
            content = f.read()
        
        tree = self.parser.parse(content)
        cursor = tree.walk()
        
        # Simplified extraction logic for MVP
        # We look for classes and functions
        self._traverse_tree(cursor, file_path, session)

    def _traverse_tree(self, cursor, file_path: str, session: Session):
        """Traverses the AST to find high-level structural units."""
        node = cursor.node
        
        if node.type in ["class_definition", "function_definition"]:
            name_node = node.child_by_field_name("name")
            if name_node:
                name = name_node.text.decode("utf-8")
                node_id = self._get_node_id(file_path, name, node.type)
                
                # Update or Insert Node
                dtg_node = session.query(DTGNode).filter_by(id=node_id).first()
                if not dtg_node:
                    dtg_node = DTGNode(
                        id=node_id,
                        name=name,
                        node_type=node.type,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1
                    )
                    session.add(dtg_node)
                    logger.debug("dtg_node_discovered", name=name, type=node.type)

        if cursor.goto_first_child():
            self._traverse_tree(cursor, file_path, session)
            while cursor.goto_next_sibling():
                self._traverse_tree(cursor, file_path, session)
            cursor.goto_parent()
