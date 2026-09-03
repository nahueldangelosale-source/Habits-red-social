import logging
from neo4j import GraphDatabase, AsyncGraphDatabase

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self, uri: str = "bolt://localhost:7687", user: str = "neo4j", password: str = "bienestar_dev_2026"):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None

    async def connect(self):
        try:
            self.driver = AsyncGraphDatabase.driver(self.uri, auth=(self.user, self.password))
            await self.driver.verify_connectivity()
            logger.info("[OK] Neo4j connection established.")
        except Exception as e:
            logger.warning(f"[WARN] Neo4j not available: {e}")

    async def close(self):
        if self.driver:
            await self.driver.close()
            logger.info("[INFO] Neo4j connection closed.")

    async def execute_query(self, query: str, parameters=None):
        if not self.driver:
            await self.connect()
            
        async with self.driver.session() as session:
            try:
                result = await session.run(query, parameters)
                records = await result.data()
                return records
            except Exception as e:
                logger.error(f"[ERROR] Error executing Cypher query: {e}")
                return []

neo4j_client = Neo4jClient()
