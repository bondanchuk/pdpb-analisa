import csv
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database import get_connection
from io import StringIO
from datetime import datetime



router = APIRouter(prefix="/analisa", tags=["Potensial Ganda Dalam Kab/Kota"])

@router.get("/potensial-dalam-kabko-export")
def export_potensial_dalam_kabko(
    kabkota: str = Query(..., description="Nama kabupaten/kota")
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM v_ganda_identitas_dalam_kabko_detail
            WHERE kabkota = %s
            ORDER BY "NAMA", "TANGGAL LAHIR", "TEMPAT LAHIR", "NIK"
        """, (kabkota,))
        rows = cur.fetchall()

        if not rows:
            return {"message": f"Tidak ada data potensi ganda untuk {kabkota}"}

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

        filename = f"potensial_ganda_dalam_{kabkota}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()




@router.get("/potensial-dalam-kabko")
def potensial_dalam_kabko(
    kabkota: str = Query("", description="Filter kabupaten/kota. Kosong = semua"),
    keyword: str = Query("", description="Cari nama/tempat lahir/nik"),
    page: int = 1,
    limit: int = 50
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
            where += " AND (nama ILIKE %s OR tempat_lahir ILIKE %s OR nik ILIKE %s)"
            params += [f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"]

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_identitas_dalam_kabko {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_identitas_dalam_kabko
            {where}
            ORDER BY jumlah DESC
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()


@router.get("/potensial-dalam-kabko-detail")
def potensial_dalam_kabko_detail(
    kabkota: str = Query("", description="Filter kabupaten/kota. Kosong = semua"),
    keyword: str = Query("", description="Cari nama/tempat lahir/nik"),
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
            where += " AND (nik ILIKE %s OR \"NAMA\" ILIKE %s OR \"TEMPAT LAHIR\" ILIKE %s)"
            params += [f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"]

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_identitas_dalam_kabko_detail {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_identitas_dalam_kabko_detail
            {where}
            ORDER BY kabkota, "NAMA", "TANGGAL LAHIR", "TEMPAT LAHIR", "NIK"
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()
