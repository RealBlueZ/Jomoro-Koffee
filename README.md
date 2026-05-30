# HOW TO GET STARTED

## 1. Auth Service

  start by running this command in your CLI, inside the directory Auth Service:
  
    npm install @prisma/client
    npm install -D prisma
    npx prisma init --datasource-provider mysql
    npm install @nestjs/passport passport passport-jwt @nestjs/jwt
    npm install -D @types/passport-jwt
    npm install class-validator class-transformer
    npm install mysql2 @prisma/adapter-mariadb
    npm install @nestjs/swagger

## 2. Product Service

  start by running this command in your CLI, inside the directory Product Service:
  
    npm install @prisma/client
    npm install -D prisma
    npx prisma init --datasource-provider mysql
    npm install mysql2 @prisma/adapter-mariadb
    npm install class-validator class-transformer @nestjs/swagger
    npm install @nestjs/axios axios
  
## 3. Trasaction Service

  start by running this command in your CLI, inside the directory Transaction Service:
  
    npm install @prisma/client
    npm install -D prisma
    npm install @nestjs/passport passport passport-jwt
    npm install -D @types/passport-jwt
    npm install @nestjs/axios axios
    npm install mysql2 @prisma/adapter-mariadb
    npm install class-validator class-transformer @nestjs/swagger

## 4. Database

  start running your XAMPP (Apache & MySQL). Prisma will make your table automatically.

## 5. Configure env
  configure the env on every services.
  
  A. env (on auth-service)
  
    DATABASE_URL="mysql://root:@localhost:3306/your_database_name-auth
    PORT=3001
    JWT_SECRET=
    
  for JWT_SECRET you can use your own or mine "JomoroKoffeeAuthService"

  B. env (on product-service)

    DATABASE_URL="mysql://root:@localhost:3306/your_database_name-product
    PORT=3002
    JWT_SECRET=
    
  for JWT_SECRET you can use your own or mine "JomoroKoffeeProductService"

  C. env (on transaction-service)

    DATABASE_URL="mysql://root:@localhost:3306/your_database_name-transaction
    PORT=3002
    JWT_SECRET=
    
  for JWT_SECRET you can use your own or mine "JomoroKoffeeTransactionService"

  NOTE: if you use your own key, then you must change every file that needs the JWT_SECRET. It you don't change it, it will validate either the env or my own key.

  ## 6. Prisma

  run this command in every service folder in CLI:
  
    npx prisma migrate dev --name init
    
  this command will make the database for you.

  now, run this command in every folder :
  
    npx prisma generate

  this will generate the prima client in every folder.
  
