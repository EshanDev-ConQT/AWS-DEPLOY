import { Client } from 'ssh2';
import readline from 'readline';
import { readFileSync } from 'fs';

const conn = new Client();

const EC2_HOST = '13.201.168.48';
const EC2_USERNAME = 'ubuntu';
const PRIVATE_KEY_PATH = '/home/eshan/Downloads/LostKey.pem'; // Your .pem file

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const performOperation = () => {
  rl.question('Enter the operation (create, read, update, delete, exit): ', (operation) => {
    const filename = 'test.txt';
    const fileContent = 'Hello, EC2!';

    console.log(`Received operation: ${operation}`); // Debugging

    switch (operation) {
      case 'create':
        console.log('Creating file...');
        conn.exec(`echo "${fileContent}" > ${filename}`, (err, stream) => {
          if (err) {
            console.error('Error executing command:', err);
            return;
          }
          stream.on('close', () => {
            console.log(`File ${filename} created`);
            performOperation(); // Prompt for the next operation
          }).on('data', (data) => {
            console.log('Output:', data.toString()); // Additional output logging
          });
        });
        break;

      case 'read':
        console.log('Reading file...');
        conn.exec(`cat ${filename}`, (err, stream) => {
          if (err) {
            console.error('Error executing command:', err);
            return;
          }
          stream.on('data', (data) => {
            console.log(`Content of ${filename}: ${data}`);
          }).on('close', () => {
            performOperation(); // Prompt for the next operation
          });
        });
        break;

        case 'update':
          rl.question('Enter the new content for the file: ', (newContent) => {
            conn.exec(`echo "${newContent}" > ${filename}`, (err, stream) => {
              if (err) {
                console.error('Error executing command:', err);
                return;
              }
              stream.on('close', () => {
                console.log(`File ${filename} updated with new content: ${newContent}`);
                performOperation(); // Prompt for the next operation
              }).on('data', (data) => {
                console.log('Output:', data.toString()); // Additional output logging
              });
            });
          });
          break;
        
      case 'delete':
        console.log('Deleting file...');
        conn.exec(`rm ${filename}`, (err, stream) => {
          if (err) {
            console.error('Error executing command:', err);
            return;
          }
          stream.on('close', () => {
            console.log(`File ${filename} deleted`);
            performOperation(); // Prompt for the next operation
          }).on('data', (data) => {
            console.log('Output:', data.toString()); // Additional output logging
          });
        });
        break;

      case 'exit':
        console.log('Exiting...');
        conn.end(); // End the SSH connection
        rl.close(); // Close the readline interface
        break;

      default:
        console.log('Invalid operation. Use create, read, update, delete, or exit.');
        performOperation(); // Prompt for the next operation
        break;
    }
  });
};

conn.on('ready', () => {
  console.log('Client :: ready');
  performOperation(); // Start the operation loop
}).connect({
  host: EC2_HOST,
  port: 22,
  username: EC2_USERNAME,
  privateKey: readFileSync(PRIVATE_KEY_PATH),
});
