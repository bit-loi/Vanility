from database import supabase_request


def save_vanilla_batch(batch_data: dict):
    try:
        return supabase_request("POST", "vanilla_batches", data=batch_data)
    except Exception as e:
        print("Database insertion error:", str(e))
        return None
