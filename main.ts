import { CSVReader, writeCSV } from "https://deno.land/x/csv/mod.ts";
import DBServices from './src/db.ts';
import { Gender } from "./src/interfaces.ts";
import Person from "./src/Person.ts";


const saveCSV = async (fhandler: Deno.File, dataset: Person[]) => {    
  const rows: string[][] = [];    
    
  const header = ["id", "first_name", "last_name", "gender", "age", "email", "phone" ];
  rows.push(header);
  for (let i = 0 ; i < dataset.length; i++) {
    const current: string[] = []; 
    current.push(dataset[i].id);
    current.push(dataset[i].first_name);
    current.push(dataset[i].last_name);
    current.push(dataset[i].gender);
    current.push(`${dataset[i].age}`);
    current.push(dataset[i].email);
    current.push(dataset[i].phone);
    rows.push(current);
  }
   
  try {
    await writeCSV(fhandler, rows)
  } catch (error) {
    console.error(error)
  }             
}

const f = await Deno.open("./data/MOCK_DATA.csv", { read: true, write: false });

let row: string[] = [];
const rows: Person[] = [];

const reader = new CSVReader(f, {
  columnSeparator: ",",
  lineSeparator: "\n",
  onCell(cell: string) {
    row.push(cell);
  },
  onRowEnd() {    
    const person: Person = new Person(row[0], row[1], row[2], row[3] as Gender,
      parseInt(row[4]), row[5], row[6]);
    rows.push(person);
    row = [];
  },
  onEnd() {  
    const db = new DBServices("./config/dbconfig.json"); 
    setTimeout(() => {
      const result = db.insertData(rows);
      result.then(() => {
        console.log("Done inserting!");        
        f.close();

        setTimeout(async () => {
          console.log("Querying data...");
          try {
            // const data = await db.queryDB(`SELECT * from persons 
            //            WHERE gender = 'Female' AND age BETWEEN 20 AND 50;`);
            const data = await db.queryDB(`SELECT * from persons 
                       WHERE gender = 'Male' AND (age < 18 OR age > 65);`);
            if(data) { 
              const fname: string = "./data/output_males.csv"; 
              const fhandler = await Deno.open(fname, { write: true, create: true, truncate: true});           
              await saveCSV(fhandler, data);
              fhandler.close();
              console.log(`Query results saved to ${fname}`);                                                              
            }                        
          } catch (error) {
            console.error(error);
          }          
        }, 2000);
      })
      .catch(e => {
        console.log(e);
      });
    }, 2000)             
  },
  onError(err) {
    console.error(err);
  }
});

reader.read();





