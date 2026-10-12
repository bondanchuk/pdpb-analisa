from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database import get_connection
from io import StringIO
import csv
from datetime import datetime

router = APIRouter(prefix="/analisa", tags=["Potensial Ganda Antar Kab/Kota"])


@router.get("/potensial-antar-kabko-export")
def export_potensial_antar_kabko(keyword: str = Query(default="")):
 
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE 1=1"
        params = []

        if keyword:
            where += ' AND ("NIK" ILIKE %s OR "NAMA" ILIKE %s OR "TEMPAT LAHIR" ILIKE %s)'
            params.extend([f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"])

        cur.execute(f"""
            SELECT *
            FROM v_ganda_identitas_antar_kabko_detail
            {where}
            ORDER BY "NAMA", "TANGGAL LAHIR", "TEMPAT LAHIR", kabkota, "NIK"
        """, params)

        rows = cur.fetchall()

        if not rows:
            headers = ["message"]
            def generate_empty():
                buffer = StringIO()
                writer = csv.writer(buffer)
                writer.writerow(headers)
                writer.writerow(["Tidak ada data untuk diexport"])
                yield buffer.getvalue()

            filename = f"potensial_ganda_antar_kabko_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return StreamingResponse(
                generate_empty(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

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

        filename = f"potensial_ganda_antar_kabko_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()


@router.get("/potensial-antar-kabko-detail")
def potensial_antar_kabko_detail(
    keyword: str = Query("", description="Cari nama/nik/tempat lahir"),
    page: int = 1,
    limit: int = 200
):
    offset = (page - 1) * limit
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE 1=1"
        params = []

        if keyword:
            where += ' AND ("NIK" ILIKE %s OR "NAMA" ILIKE %s OR "TEMPAT LAHIR" ILIKE %s)'
            params.extend([f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"])

        cur.execute(f"""
            SELECT COUNT(*)::bigint AS total
            FROM v_ganda_identitas_antar_kabko_detail
            {where}
        """, params)

        total = cur.fetchone()["total"]

        cur.execute(f"""
            SELECT *
            FROM v_ganda_identitas_antar_kabko_detail
            {where}
            ORDER BY "NAMA", "TANGGAL LAHIR", "TEMPAT LAHIR", kabkota, "NIK"
            LIMIT %s OFFSET %s
        """, params + [limit, offset])

        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()