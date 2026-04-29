<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil ID kategori dari route parameter 'category'
        $category = $this->route('category');
        $id = is_object($category) ? $category->id : $category;

        return [
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string'
        ];
    }
}
