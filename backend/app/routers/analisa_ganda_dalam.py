from fastapi import APIRouter, Query, HTTPException
from app.database import get_connection

router = APIRouter(prefix="/analisa", tags=["Analisa Ganda Dalam Kab/Kota"])

# ==================================================
# ✅ SUMMARY: v_ganda_dalam_kabko
# ==================================================
@router.get("/ganda-dalam-kabko")
def ganda_dalam_kabko(
    kabkota: str = Query("", description="Filter kabupaten/kota. Kosong = semua"),
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

        if kabkota:
            where += " AND kabkota = %s"
            params.append(kabkota)

        if keyword:
            where += " AND (nik ILIKE %s OR nama ILIKE %s)"
            params.extend([f"%{keyword}%", f"%{keyword}%"])

        # Total data
        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_dalam_kabko {where}", params)
        total = cur.fetchone()["total"]

        # Data paginated
        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_dalam_kabko
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


# ==================================================
# ✅ DETAIL: v_ganda_dalam_kabko_detail
# ==================================================
@router.get("/ganda-dalam-kabko/{nik}")
def ganda_dalam_kabko_detail(nik: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM v_ganda_dalam_kabko_detail
            WHERE nik = %s
            ORDER BY kabkota, "KECAMATAN", "KELURAHAN"
        """, (nik,))
        rows = cur.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="NIK tidak ditemukan atau tidak ganda")

        return {"nik": nik, "total": len(rows), "data": rows}

    finally:
        cur.close()
        conn.close()

# ==================================================
# ✅ LIST DETAIL TANPA KLIK: v_ganda_dalam_kabko_detail
# ==================================================
@router.get("/ganda-dalam-kabko-detail")
def ganda_dalam_kabko_detail_list(
    kabkota: str = Query("", description="Filter kabupaten/kota. Kosong = semua"),
    keyword: str = Query("", description="Cari nik/nama"),
    page: int = 1,
    limit: int = 100
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
            where += " AND (NIK ILIKE %s OR \"NAMA\" ILIKE %s)"
            params.extend([f"%{keyword}%", f"%{keyword}%"])

        # total data
        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_ganda_dalam_kabko_detail {where}", params)
        total = cur.fetchone()["total"]

        # data detail (urut nik)
        cur.execute(
            f"""
            SELECT *
            FROM v_ganda_dalam_kabko_detail
            {where}
            ORDER BY "NIK", "NAMA"
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()
