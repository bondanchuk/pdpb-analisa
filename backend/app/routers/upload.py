from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.database import get_connection
import io

router = APIRouter(tags=["Upload"])

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    kabkota_id: str = Form(...),
    kabkota: str = Form(...)
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # Bersihkan staging sebelum upload baru
        cur.execute("TRUNCATE TABLE pdpb_staging;")
        conn.commit()

        # Baca file ke memory (bisa juga streaming, tapi ini cukup untuk 800k)
        content = await file.read()
        csv_data = io.StringIO(content.decode("utf-8", errors="ignore"))

        # Skip header CSV
        header = csv_data.readline()

        # COPY ke staging
        copy_sql = """
    COPY pdpb_staging(
        "KEC_ID","KECAMATAN","KEL_ID","KELURAHAN","DPID","NKK","NIK","NAMA",
        "TEMPAT LAHIR","TANGGAL LAHIR","STS KAWIN","KELAMIN","ALAMAT","RT","RW",
        "DISABILITAS","EKTP","KETERANGAN","SUMBER","TPS_ID","TPS","K1","K2","K3",
        "UPDATED_AT","STATUS","RANK","TAHAPAN_ID","PROV_ASAL","KAB_ASAL","KEC_ASAL","KEL_ASAL"
    )
    FROM STDIN
    WITH (FORMAT text, DELIMITER '#', NULL '', HEADER false);
"""
        cur.copy_expert(copy_sql, csv_data)
        conn.commit()

        # Hitung row staging
        cur.execute("SELECT COUNT(*)::bigint AS cnt FROM pdpb_staging;")
        staging_rows = cur.fetchone()["cnt"]

        return {
            "status": "success",
            "filename": file.filename,
            "kabkota_id": kabkota_id,
            "kabkota": kabkota,
            "staging_rows": staging_rows
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()
