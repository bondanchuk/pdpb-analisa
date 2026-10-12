from fastapi import APIRouter, Query
from app.database import get_connection

router = APIRouter(prefix="/rekap", tags=["Model Rekap"])


# =============================
# ✅ Rekap Pemilih Provinsi
# =============================
@router.get("/provinsi")
def rekap_provinsi():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM v_model_rekap_provinsi_pdpb")
        data = cur.fetchall()

        cur.execute("SELECT * FROM v_model_rekap_provinsi_pdpb_total")
        total = cur.fetchone()

        return {"data": data, "total": total}
    finally:
        cur.close()
        conn.close()



