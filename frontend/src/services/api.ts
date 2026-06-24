const API_URL = "http://127.0.0.1:8000";

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
    baseURL: "http://localhost:8000",
});