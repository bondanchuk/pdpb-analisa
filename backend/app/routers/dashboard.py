from fastapi import APIRouter
from app.database import get_connection

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

FILTER_STATUS = ("aktif", "ubah", "baru")
FILTER_KET = ("0", "u", "b", "10", "91", "90")

@router.get("/active-per-kabkota")
def active_per_kabkota():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT kabkota, COUNT(*)::bigint AS total
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s)
            GROUP BY kabkota
            ORDER BY total DESC;
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        rows = cur.fetchall()
        return [{"kabkota": r["kabkota"], "total": r["total"]} for r in rows]
    finally:
        cur.close()
        conn.close()


@router.get("/pemula-per-kabkota")
def pemula_per_kabkota():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT kabkota, COUNT(*)::bigint AS total
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s)
              AND "STS KAWIN" = 'B'
              AND "TANGGAL LAHIR" BETWEEN DATE '2007-11-28' AND DATE '2008-12-31'
            GROUP BY kabkota
            ORDER BY total DESC;
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        rows = cur.fetchall()
        return [{"kabkota": r["kabkota"], "total": r["total"]} for r in rows]
    finally:
        cur.close()
        conn.close()


@router.get("/gender-overall")
def gender_overall():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
              CASE
                WHEN upper("KELAMIN") IN ('L','LAKI-LAKI','LAKI') THEN 'Laki-laki'
                WHEN upper("KELAMIN") IN ('P','PEREMPUAN') THEN 'Perempuan'
                ELSE 'Tidak diketahui'
              END AS gender,
              COUNT(*)::bigint AS total
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s)
            GROUP BY gender
            ORDER BY total DESC;
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        rows = cur.fetchall()
        return [{"gender": r["gender"], "total": r["total"]} for r in rows]
    finally:
        cur.close()
        conn.close()


@router.get("/summary")
def summary():
    conn = get_connection()
    cur = conn.cursor()
    try:
        # total aktif (sesuai filter status+keterangan)
        cur.execute(
            """
            SELECT COUNT(*)::bigint AS total_aktif
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s);
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        total_aktif = cur.fetchone()["total_aktif"]

        # total pemula
        cur.execute(
            """
            SELECT COUNT(*)::bigint AS total_pemula
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s)
              AND "STS KAWIN" = 'B'
              AND "TANGGAL LAHIR" BETWEEN DATE '2007-11-28' AND DATE '2008-12-31';
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        total_pemula = cur.fetchone()["total_pemula"]

        # L/P
        cur.execute(
            """
            SELECT
              SUM(CASE WHEN upper("KELAMIN") IN ('L','LAKI-LAKI','LAKI') THEN 1 ELSE 0 END)::bigint AS laki,
              SUM(CASE WHEN upper("KELAMIN") IN ('P','PEREMPUAN') THEN 1 ELSE 0 END)::bigint AS perempuan
            FROM pdpb
            WHERE "STATUS" = ANY(%s)
              AND "KETERANGAN" = ANY(%s);
            """,
            (list(FILTER_STATUS), list(FILTER_KET)),
        )
        g = cur.fetchone()

        return {
            "total_aktif": total_aktif,
            "total_pemula": total_pemula,
            "laki": g["laki"],
            "perempuan": g["perempuan"],
        }
    finally:
        cur.close()
        conn.close()
