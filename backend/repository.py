from database import supabase_request


def save_vanilla_batch(batch_data: dict):
    try:
        return supabase_request("POST", "vanilla_batches", data=batch_data)
    except Exception as e:
        print("Database insertion error:", str(e))
        return None


def get_vanilla_batch(batch_id: int):
    try:
        res = supabase_request("GET", f"vanilla_batches?id=eq.{batch_id}")
        if res and len(res) > 0:
            return res[0]
        return None
    except Exception as e:
        print(f"Error fetching vanilla batch {batch_id}: {e}")
        return None
