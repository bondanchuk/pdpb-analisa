from fastapi import APIRouter, Query
from app.database import get_connection

router = APIRouter(prefix="/analisa", tags=["Analisa Ganda Antar Kab/Kota"])

# ==================================================
# ✅ SUMMARY: v_ganda_antar_kabko
# ==================================================
@router.get("/ganda-antar-kabko")
def ganda_antar_kabko(
    keyword: str = Query("", description="Cari nik/nama"),
    page: int = 1,
    limit: int = 50
):
    offset = (page - 1) * limit
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE 1=1"
        params = []

        if keyword:
            where += " AND (nik ILIKE %s OR nama ILIKE %s)"
            params.extend([f"%{keyword}%", f"%{keyword}%"])

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_antar_kabko {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_antar_kabko
            {where}
            ORDER BY jumlah_kabkota DESC, jumlah_record DESC
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
# ✅ DETAIL LIST: v_ganda_antar_kabko_detail (tanpa klik)
# ==================================================
@router.get("/ganda-antar-kabko-detail")
def ganda_antar_kabko_detail(
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

        if keyword:
            where += " AND (nik ILIKE %s OR \"NAMA\" ILIKE %s)"
            params.extend([f"%{keyword}%", f"%{keyword}%"])

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_antar_kabko_detail {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_antar_kabko_detail
            {where}
            ORDER BY "NIK", kabkota, "KECAMATAN", "KELURAHAN"
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()
