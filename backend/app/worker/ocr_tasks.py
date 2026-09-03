from app.worker.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import ClinicalDocument
from app.services.ocr_service import get_ocr_service
import uuid
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="process_clinical_document_task")
def process_clinical_document_task(self, doc_id: str):
    """
    Tarea asíncrona que procesa un documento clínico mediante OCR/IA.
    Recupera el documento, llama al servicio OCR y actualiza el estado.
    """
    db = SessionLocal()
    try:
        document = db.query(ClinicalDocument).filter(ClinicalDocument.id == uuid.UUID(doc_id)).first()
        if not document:
            logger.error(f"Documento {doc_id} no encontrado en la BD.")
            return

        if document.status != "processing":
            logger.info(f"El documento {doc_id} ya fue procesado (estado: {document.status}).")
            return

        # Obtenemos el servicio OCR (Mock para MVP)
        ocr_service = get_ocr_service()
        
        mime_type = document.file_metadata.get("mime_type", "application/pdf") if document.file_metadata else "application/pdf"
        
        try:
            # Procesar documento
            extracted_data, confidence_score = ocr_service.extract(document.file_url, mime_type)
            
            document.extracted_data = extracted_data
            document.confidence_score = confidence_score
            
            # Quarantine Vault Logic (HITL)
            if confidence_score < 0.85:
                document.status = "pending_review"
            else:
                # Opcional: podríamos pasar a 'verified' directo si el confidence > 95%
                # Pero la política de cero confianza exige revisión siempre.
                document.status = "pending_review"

        except Exception as e:
            logger.exception(f"Error procesando documento {doc_id} en OCR:")
            document.status = "failed"
            document.extracted_data = {"error": str(e)}

        db.commit()
        
        # Opcional: Aquí se podría despachar un evento SSE a Redis PubSub
        
        return {"doc_id": doc_id, "status": document.status}

    finally:
        db.close()
