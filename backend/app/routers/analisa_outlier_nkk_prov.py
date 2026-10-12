from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database import get_connection
from io import StringIO
from datetime import datetime
import csv

router = APIRouter(prefix="/analisa", tags=["Outlier NKK Provinsi"])


# ===============================
# ✅ SUMMARY OUTLIER NKK PROVINSI
# ===============================
@router.get("/outlier-nkk-prov-summary")
def outlier_nkk_prov_summary(
    min_orang: int = Query(10, description="Minimal jumlah NIK dalam 1 NKK"),
    page: int = 1,
    limit: int = 200
):
    offset = (page - 1) * limit
    conn = get_connection()
    cur = conn.cursor()

    try:
        # total
        cur.execute("""
            SELECT COUNT(*)::bigint AS total
            FROM v_outlier_nkk_prov_summary
            WHERE jumlah_nik > %s
        """, (min_orang,))
        total = cur.fetchone()["total"]

        # data
        cur.execute("""
            SELECT *
            FROM v_outlier_nkk_prov_summary
            WHERE jumlah_nik > %s
            ORDER BY jumlah_nik DESC
            LIMIT %s OFFSET %s
        """, (min_orang, limit, offset))
        rows = cur.fetchall()

        return {"total": total, "page": page, "limit": limit, "data": rows}

    finally:
        cur.close()
        conn.close()


# ===============================
# ✅ DETAIL BY NKK (PROVINSI)
# ===============================
@router.get("/outlier-nkk-prov-detail")
def outlier_nkk_prov_detail(
    nkk: str
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM v_outlier_nkk_prov_detail
            WHERE "NKK" = %s
            ORDER BY kabkota, "KECAMATAN", "KELURAHAN", "TPS", "NAMA"
        """, (nkk,))
        rows = cur.fetchall()
        return {"data": rows}

    finally:
        cur.close()
        conn.close()


# ===============================
# ✅ EXPORT SUMMARY CSV (PROVINSI)
# ===============================
@router.get("/outlier-nkk-prov-export")
def outlier_nkk_prov_export(
    min_orang: int = Query(10)
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM v_outlier_nkk_prov_summary
            WHERE jumlah_nik > %s
            ORDER BY jumlah_nik DESC
        """, (min_orang,))
        rows = cur.fetchall()

        if not rows:
            return {"message": "Tidak ada data outlier NKK provinsi."}

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

        filename = f"outlier_nkk_prov_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()


# ===============================
# ✅ EXPORT DETAIL CSV BY NKK
# ===============================
@router.get("/outlier-nkk-prov-export-detail")
def outlier_nkk_prov_export_detail(
    nkk: str
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT *
            FROM v_outlier_nkk_prov_detail
            WHERE "NKK" = %s
            ORDER BY kabkota, "KECAMATAN", "KELURAHAN", "TPS", "NAMA"
        """, (nkk,))
        rows = cur.fetchall()

        if not rows:
            return {"message": "Tidak ada detail untuk NKK tersebut."}

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

        filename = f"outlier_nkk_prov_detail_{nkk}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    finally:
        cur.close()
        conn.close()
