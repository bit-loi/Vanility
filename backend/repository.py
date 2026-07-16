from database import supabase

def save_vanilla_batch(batch_data: dict):
    try:
        return supabase.table("vanilla_batches").insert(batch_data).execute()
    except Exception as e:
        print("Database insertion error:", str(e))
        return None
