from sqlalchemy import Column, String, Integer, ForeignKey, JSON, create_engine
from sqlalchemy.orm import relationship, DeclarativeBase, sessionmaker

# Dedicated Base for DTG to keep it isolated from main business models (Postgres)
class DTGBase(DeclarativeBase):
    pass

class DTGNode(DTGBase):
    __tablename__ = "dtg_nodes"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    node_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    start_line = Column(Integer)
    end_line = Column(Integer)
    metadata_json = Column(JSON)

class DTGEdge(DTGBase):
    __tablename__ = "dtg_edges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, ForeignKey("dtg_nodes.id"), nullable=False)
    target_id = Column(String, ForeignKey("dtg_nodes.id"), nullable=False)
    edge_type = Column(String, nullable=False) # transforms_to, calls, depends_on
    
    source = relationship("DTGNode", foreign_keys=[source_id])
    target = relationship("DTGNode", foreign_keys=[target_id])

# SQLite Engine for DTG (Turso alignment)
DTG_DB_URL = "sqlite:///dtg.db"
dtg_engine = create_engine(DTG_DB_URL)
dtg_session_maker = sessionmaker(bind=dtg_engine)

def init_dtg_schema():
    DTGBase.metadata.create_all(dtg_engine)
