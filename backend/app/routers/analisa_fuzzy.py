from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database import get_connection
from io import StringIO
from datetime import datetime
import csv

router = APIRouter(prefix="/analisa", tags=["Fuzzy Matching"])


@router.get("/fuzzy-summary")
def fuzzy_summary(
    kabkota: str = Query("", description="Filter Kab/Kota"),
    min_score: float = Query(0.85, description="Minimal skor similarity"),
    page: int = 1,
    limit: int = 200
):
    offset = (page - 1) * limit
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE skor_similarity >= %s"
        params = [min_score]

        if kabkota:
            where += " AND kabkota = %s"
            params.append(kabkota)

        cur.execute(f"SELECT COUNT(*)::bigint AS total FROM v_fuzzy_match_summary {where}", params)
        total = cur.fetchone()["total"]

        cur.execute(
            f"""
            SELECT *
            FROM v_fuzzy_match_summary
            {where}
            ORDER BY skor_similarity DESC
            LIMIT %s OFFSET %s
            """,
            params + [limit, offset]
        )
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()


@router.get("/fuzzy-detail")
def fuzzy_detail(
    kabkota: str,
    nik1: str,
    nik2: str,
    tanggal_lahir: str
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM pdpb
            WHERE kabkota = %s
              AND "TANGGAL LAHIR" = %s
              AND "NIK" IN (%s, %s)
        """, (kabkota, tanggal_lahir, nik1, nik2))

        rows = cur.fetchall()
        return {"data": rows}

    finally:
        cur.close()
        conn.close()


@router.get("/fuzzy-export")
def export_fuzzy_csv(
    kabkota: str = Query("", description="Kosong = semua kabkota"),
    min_score: float = Query(0.85)
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        where = "WHERE skor_similarity >= %s"
        params = [min_score]

        if kabkota:
            where += " AND kabkota = %s"
            params.append(kabkota)

        cur.execute(f"""
            SELECT *
            FROM v_fuzzy_match_summary
            {where}
            ORDER BY skor_similarity DESC
        """, params)

        rows = cur.fetchall()
        if not rows:
            return {"message": "Tidak ada data fuzzy match."}

        headers = rows[0].keys()

        def generate():
            buf = StringIO()
            writer = csv.writer(buf)

            writer.writerow(headers)
            yield buf.getvalue()
            buf.seek(0); buf.truncate(0)

            for r in rows:
                writer.writerow([r[h] for h in headers])
                yield buf.getvalue()
                buf.seek(0); buf.truncate(0)

        filename = f"fuzzy_matching_{kabkota or 'SEMUA'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()
