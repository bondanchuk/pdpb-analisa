from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database import get_connection
from io import StringIO
from datetime import datetime
import csv

router = APIRouter(prefix="/anomali", tags=["Analisa Anomali Kelamin"])


# ==================================================
# ✅ LIST DATA ANOMALI KELAMIN (NIK)
# ==================================================
@router.get("/kelamin")
def anomali_kelamin(
    kabkota: str = Query("", description="Filter kabupaten/kota"),
    keyword: str = Query("", description="Cari nik/nama"),
    page: int = 1,
    limit: int = 200
):
    offset = (page - 1) * limit
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE 1=1"
        params = []

        if kabkota:
            where += " AND kabkota = %s"
            params.append(kabkota)

        if keyword:
            where += ' AND ("NIK" ILIKE %s OR "NAMA" ILIKE %s)'
            params.extend([f"%{keyword}%", f"%{keyword}%"])

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_anomali_kelamin_nik {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_anomali_kelamin_nik
            {where}
            ORDER BY kabkota, "KECAMATAN", "KELURAHAN"
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()


# ==================================================
# ✅ EXPORT CSV DATA ANOMALI KELAMIN
# ==================================================
@router.get("/kelamin-export")
def export_anomali_kelamin_csv(
    kabkota: str = Query("", description="Filter kabupaten/kota. Kosong = semua")
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = ""
        params = []

        if kabkota:
            where = "WHERE kabkota = %s"
            params.append(kabkota)

        cur.execute(
            f"""
            SELECT *
            FROM v_anomali_kelamin_nik
            {where}
            ORDER BY kabkota, "KECAMATAN", "KELURAHAN"
            """,
            params
        )
        rows = cur.fetchall()

        if not rows:
            return {"message": "Tidak ada data anomali kelamin untuk filter tersebut"}

        headers = rows[0].keys()

        def generate():
            buffer = StringIO()
            writer = csv.writer(buffer)

            writer.writerow(headers)
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

            for row in rows:
                writer.writerow([row[h] for h in headers])
                yield buffer.getvalue()
                buffer.seek(0)
                buffer.truncate(0)

        filename = f"anomali_kelamin_{kabkota or 'SEMUA'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()
