from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Form Builder SaaS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "formbuilder"
    SQLALCHEMY_DATABASE_URI: str | None = None

    class Config:
        case_sensitive = True

    @property
    def database_url(self) -> str:
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        # Default to a local SQLite file instead of Postgres
        return "sqlite:///./formbuilder.db"

settings = Settings()
