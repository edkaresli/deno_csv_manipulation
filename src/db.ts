import { Pool } from "https://deno.land/x/pg@v0.5.0/mod.ts";
import Person from "./Person.ts";
import { Connection } from './interfaces.ts';

class DBServices {
    connectionOptions: Connection;
    pool: Pool;

    constructor(configFile: string) {
        const config = JSON.parse(Deno.readTextFileSync(configFile));
        this.connectionOptions = { user: config.user, hostname: config.hostname, 
            database: config.database, password: config.password, port: config.port }; 
        
        this.pool = new Pool(this.connectionOptions);    
        
        this.setupDB().
          then(() => console.log("DB setup OK"))
          .catch(e => {
              console.log(e);
          })  
    }    

    setupDB = async () => {
        try {            
           // await this.pool.query('DROP TABLE IF EXISTS persons');
           // await this.pool.query('DROP TYPE IF EXISTS Gend');                
            await this.pool.query(`CREATE TYPE Gend AS ENUM ('Male', 'Female')`);            
            await this.pool.query(`CREATE TABLE persons (
            id            text PRIMARY KEY, 
            first_name    text NOT NULL,
            last_name     text NOT NULL,
            gender        Gend NOT NULL,
            age           integer NOT NULL,
            email         text NOT NULL,            
            phone         text NOT NULL
            )`);
            
        } catch (error) {
            console.log(error);
        }      
    }
    
    async insertData(datarows: Person[]): Promise<void> {       
         
         let rows: string = '';
         for(let i = 1; i < datarows.length; i++) {    
           const person: Person = datarows[i];
         
           const currentValue = `('${person.id}', '${person.first_name}', '${person.last_name.replace("'","''")}', 
                               '${person.gender}', '${person.age}', '${person.email}', '${person.phone}'),`; 
           rows += currentValue;
         }

         if(rows.endsWith(',')){
            rows = rows.slice(0, rows.length - 1); 
         }
         
         const sqlStatement = `INSERT INTO persons (id, first_name, last_name, gender, age, email, phone) VALUES ${rows};`
         
         let client = null;
         try {
           client = await this.pool.connect();
           await client.query(sqlStatement);        
         } 
         catch (error) {
             console.error(error);      
         }
         finally {
            if (client)
              client.release();
         }
    }    
    
    async queryDB(sql: string): Promise<Person[] | undefined>   {
        let rows: Person[] = [];
        try {
            const client = await this.pool.connect();
            const res = await client.query(sql);
            rows = res.rows;
            return rows;            
        } 
        catch (error) {
          console.error(error);    
        }        
    }
}


export default DBServices;

