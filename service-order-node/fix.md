malah muncul output ini

di 8000
{
  "status": "error",
  "message": "Database file at path [/app/database/database.sqlite] does not exist. Ensure this is an absolute path to the database. (Connection: sqlite, Database: /app/database/database.sqlite, SQL: select count(*) as aggregate from \"users\")"
}

di 8001
Illuminate\Database\QueryException
vendor/laravel/framework/src/Illuminate/Database/Connection.php:841
SQLSTATE[HY000]: General error: 1 no such table: products (Connection: sqlite, Database: /app/database/database.sqlite, SQL: select count(*) as aggregate from "products")

