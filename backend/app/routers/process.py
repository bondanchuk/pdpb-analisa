from fastapi import APIRouter, HTTPException
from app.database import get_connection

router = APIRouter(prefix="/process", tags=["Process"])

@router.post("/staging-to-pdpb")
def staging_to_pdpb(kabkota_id: str, kabkota: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # INSERT dari staging ke pdpb + inject kabkota
        cur.execute("""
            INSERT INTO pdpb(
                kabkota_id, kabkota,
                "KEC_ID","KECAMATAN","KEL_ID","KELURAHAN","DPID","NKK","NIK","NAMA",
                "TEMPAT LAHIR","TANGGAL LAHIR","STS KAWIN","KELAMIN","ALAMAT","RT","RW",
                "DISABILITAS","EKTP","KETERANGAN","SUMBER","TPS_ID","TPS","K1","K2","K3",
                "UPDATED_AT","STATUS","RANK","TAHAPAN_ID","PROV_ASAL","KAB_ASAL","KEC_ASAL","KEL_ASAL"
            )
            SELECT
                %s, %s,
                "KEC_ID","KECAMATAN","KEL_ID","KELURAHAN","DPID","NKK","NIK","NAMA",
                "TEMPAT LAHIR","TANGGAL LAHIR","STS KAWIN","KELAMIN","ALAMAT","RT","RW",
                "DISABILITAS","EKTP","KETERANGAN","SUMBER","TPS_ID","TPS","K1","K2","K3",
                "UPDATED_AT","STATUS","RANK","TAHAPAN_ID","PROV_ASAL","KAB_ASAL","KEC_ASAL","KEL_ASAL"
            FROM pdpb_staging;
        """, (kabkota_id, kabkota))

        inserted = cur.rowcount
        conn.commit()

        return {
            "status": "success",
            "kabkota_id": kabkota_id,
            "kabkota": kabkota,
            "pdpb_rows": inserted
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()
