const API_URL = "https://product-browser-1-lgza.onrender.com";

export async function getProducts(
    limit = 20,
    category?: string,
    cursorUpdatedAt?: string,
    cursorId?: string
) {
    const params = new URLSearchParams();

    params.append("limit", limit.toString());

    if (category) {
        params.append("category", category);
    }

    if (cursorUpdatedAt) {
        params.append(
            "cursor_updated_at",
            cursorUpdatedAt
        );
    }

    if (cursorId) {
        params.append(
            "cursor_id",
            cursorId
        );
    }

    const response = await fetch(
        `${API_URL}/products?${params}`
    );

    return response.json();
}
import axios from "axios";

export const api = axios.create({
    baseURL: "https://product-browser-1-lgza.onrender.com",
});