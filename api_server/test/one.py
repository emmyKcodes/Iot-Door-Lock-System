from fastapi import FastAPI, Path
from typing import Optional
from pydantic import BaseModel 

# uvicorn main:app --reload --port 8000

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    brand: Optional[str] = None


inventory = {
    1: {"name": "Widget", "quantity": 10, "price": 2.99},
    2: {"name": "Gadget", "quantity": 5, "price": 19.99},
    3: {"name": "Doodad", "quantity": 0, "price": 0.99},
    4: {"name": "Goose", "quantity": 2, "price": 5.49},
}

@app.get("/")
def home():
    """Home endpoint that returns a simple message."""
    return {"Data": {"message": "Hello, World!"}}


@app.get("/about")
def about():
    """About endpoint that returns information about the API."""
    return {
        "Data": {
            "name": "FastAPI Example",
            "version": "1.0.0",
            "description": "This is a simple FastAPI application."
        }
    }

@app.get("/get-item/{item_id}")
def get_item(item_id: int = Path(description="The ID of the items, i would like to view", gt=0)):
    return inventory.get(item_id, {"error": "Item not found"})

@app.get("/get-by-name")
def get_item_(name: Optional[str] = None):
    """Get an item by its name."""
    for item_id, item in inventory.items():
        if item["name"] == name.capitalize():
            return {"item_id": item}
        
    return {"error": "Item not found"}   
    
@app.post("/create-item/itemize")
def create_item(item: Item):
    """Create a new item in the inventory."""
    return {"name": item.name, "price": item.price, "brand": item.brand}
