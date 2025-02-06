# David's SaaS Backend Project

In order to run the application, follow these steps:

1.  **Install dependencies:**

```bash
npm install
```

2.  **Start the application:**

```bash
npm run dev
```

If you're using Docker, simply run:

```bash
docker  run  -p  4000:4000  saas-backend
```

3. **Postman API**

The application has a `saas-backend.postman_collection.json` file that you can **import** into Postman and see the collection of APIs for the reference.

![alt text](image.png)

4. **Postman API**

In order to see Prisma Studio for database collection, write in the terminal:

```bash
npx prisma studio
```

# Application Workflow

1. **Registration:**  
   The user first registers by filling out the registration form.

2. **Login:**  
   After registering, the user logs in to access the application.

3. **Company Creation:**  
   Once logged in, the user can create a company.
   **Important:** In the registration form's body, make sure to enter a **valid email address**. You will receive an actual email to activate your company.  
   **NOTE:** The activation email WILL land in your spam folder, so be sure to check there!
