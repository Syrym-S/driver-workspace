FTP_HOST=ftp.example.com
FTP_PORT=21
FTP_USER=my_user
FTP_PASSWORD=my_password
import dotenv from 'dotenv';
import FtpDeploy from 'ftp-deploy';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config({ path: '.env.ftp' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ftpDeploy = new FtpDeploy();

const config = {
   user: process.env.FTP_USER,
   password: process.env.FTP_PASSWORD,
   host: process.env.FTP_HOST,
   port: parseInt(process.env.FTP_PORT || '21', 10),
   localRoot: __dirname + '/dist',
   remoteRoot: process.env.FTP_REMOTE_ROOT,
   include: ['*', '**/*'],
   deleteRemote: false,
};

ftpDeploy
   .deploy(config)
   .then(() => {
      console.log('Upload complete');
   })
   .catch((err) => {
      console.error(err);
   });