from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions.base import AppException
from app.routers import auth, users, tasks, subtasks, tags, projects, lists, attachments, reminders, webpushs
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.storage.minio import MinIOService

from fastapi.openapi.docs import get_swagger_ui_html


@asynccontextmanager
async def lifespan(app: FastAPI):
    # await init_db()

    minio_service = MinIOService()
    await minio_service.init_buckets()

    print('App is started: DB and MinIO is ready')

    yield

    print('App is finished.')


app = FastAPI(title="TODOLIST",
              description="Документированное API с аутентификацией",
              version="1.0.0",
              openapi_url="/api/docs/openapi.json",
              lifespan=lifespan,
              )

if not os.path.exists("static/avatars"):
    os.makedirs("static/avatars", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:3000",  # порт вашего фронта (Vue/React)
    "http://localhost:8000",
    "http://localhost:5173",
    "http://46.29.114.107:3000",  # порт вашего фронта (Vue/React)
    "http://46.29.114.107:8000",
    "http://46.29.114.107:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(lists.router)
app.include_router(tasks.router)

app.include_router(subtasks.router)

app.include_router(tags.router)

app.include_router(attachments.router)
app.include_router(reminders.router)
app.include_router(webpushs.router)

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.get("/")
async def root():
    return {"message": "TODOLIST is running"}
