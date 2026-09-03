import os
import boto3
from botocore.exceptions import ClientError
import structlog
from uuid import uuid4

logger = structlog.get_logger()

# Cloudflare R2 Configuration required in .env
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "aurea-assets")

# Public CDN domain mapped to the R2 bucket (e.g., https://assets.aurea.app)
# Falling back to a standard R2 dev domain if not defined
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://cdn.aurea-app.localhost")

class StorageService:
    """
    Service for interacting with Cloudflare R2 via S3-API (boto3).
    Configured precisely for Public Buckets & Edge Caching per CTO guidelines.
    """
    
    def __init__(self):
        # We only initialize the client if credentials exist, otherwise mock/fail gracefully
        if R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                service_name='s3',
                endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=R2_ACCESS_KEY_ID,
                aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                region_name="auto" # R2 uses auto
            )
            self.enabled = True
        else:
            logger.warning("r2_credentials_missing", reason="Storage Service running in mock mode")
            self.enabled = False

    async def upload_public_image(self, file_bytes: bytes, filename: str, content_type: str, prefix: str = "public-branding") -> str:
        """
        Subidas de archivos a R2 usando una ruta pública.
        Desarrollado según directrices del CTO para evitar latencias de Pre-Signed URLs.
        
        Args:
            file_bytes: RAW bytes to upload.
            filename: Original name or extension to derive name.
            content_type: MIME type (e.g. image/png).
            prefix: Bucket path prefix.
            
        Returns:
            The public CDN URL (string) to be saved in Postgres.
        """
        # Generate safe object key
        ext = filename.split('.')[-1] if '.' in filename else 'png'
        secure_filename = f"{uuid4().hex}.{ext}"
        object_key = f"{prefix}/{secure_filename}"
        
        if not self.enabled:
            # Mock behavior for local dev without R2 creds
            logger.info("r2_upload_mocked", object_key=object_key)
            return f"{R2_PUBLIC_DOMAIN}/{object_key}"

        try:
            # R2 no requiere public-read ACL si el bucket ya expone la carpeta
            self.s3_client.put_object(
                Bucket=R2_BUCKET_NAME,
                Key=object_key,
                Body=file_bytes,
                ContentType=content_type
            )
            
            # Construir la URL del CDN público (ej: https://assets.aurea.app/public-branding/hash.png)
            public_url = f"{R2_PUBLIC_DOMAIN}/{object_key}"
            logger.info("r2_upload_success", url=public_url)
            return public_url
            
        except ClientError as e:
            logger.error("r2_upload_failed", error=str(e), object_key=object_key)
            raise Exception("Failed to upload image to storage layer") from e

storage_service = StorageService()
