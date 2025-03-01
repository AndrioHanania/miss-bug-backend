
export default {
    dbURL: process.env.MONGO_URL || 'mongodb+srv://andrio1hanania:<db_password>@cluster0.gxk5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true',
    dbName: process.env.DB_NAME || 'miss-bugs-prod'
}