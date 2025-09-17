//NPM modules - ECMAScript Modules
import cors from 'cors';
import express, { Request, Response, Application } from 'express';
import fs from 'fs';
import https from 'https';
import { testConnection } from './services/db.ts';

// -------------- Variables modules --------------
const app: Application = express();

// -------------- Routes --------------
import userRoutes from '@routes/user.ts';
import investmentsRoute from '@routes/investments.ts';
import instrumentsRoute from '@routes/instruments.ts';
import catalogsRoute from '@routes/catalogs.ts';

// -------------- Settings --------------
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
  origin: process.env.FRONTEND_URL, // 👈  frontend
  credentials: true // 👈 habilita el envío de cookies
}));

// -------------- Routes --------------
app.get('/', (req: Request, res: Response) => {
    res.send('App rastreo de paquetes');
});

app.get('/test', (req: Request, res: Response) => {
    interface Pais {
        id: number;
        nombre: string;
        codigo_iso: string;
        moneda_local: string;
        simbolo_moneda: string;
        formato_moneda: string;
        emoji_bandera: string;
    }

    const paises: Pais[] = [
        {
            "id": 1,
            "nombre": "México",
            "codigo_iso": "MX",
            "moneda_local": "Peso mexicano",
            "simbolo_moneda": "$",
            "formato_moneda": "$#,##0.00",
            "emoji_bandera": "🇲🇽"
        },
        {
            "id": 2,
            "nombre": "Estados Unidos",
            "codigo_iso": "US",
            "moneda_local": "Dólar estadounidense",
            "simbolo_moneda": "$",
            "formato_moneda": "$#,##0.00",
            "emoji_bandera": "🇺🇸"
        }
    ];
    
    console.log(`Port: ${process.env.PORT}`);
    res.status(200).json({ paises });
});

app.get('/paises/icon', async (req: Request, res: Response) => {
    const codigosISO: string[] = [
        'af','al','dz','as','ad','ao','ai','aq','ag','ar','am','aw','au','at','az','bs','bh','bd','bb','by','be','bz','bj','bm','bt','bo','ba','bw','br','bn','bg','bf','bi','kh','cm','ca','cv','bq','cf','td','cl','cn','co','km','cd','cg','cr','ci','hr','cu','cy','cz','dk','dj','dm','do','ec','eg','sv','gq','er','ee','sz','et','fj','fi','fr','gf','pf','ga','gm','ge','de','gh','gi','gr','gl','gd','gp','gu','gt','gg','gn','gw','gy','ht','hn','hk','hu','is','in','id','ir','iq','ie','im','il','it','jm','jp','je','jo','kz','ke','ki','kp','kr','kw','kg','la','lv','lb','ls','lr','ly','li','lt','lu','mo','mk','mg','mw','my','mv','ml','mt','mh','mq','mr','mu','yt','mx','fm','md','mc','mn','me','ms','ma','mz','mm','na','nr','np','nl','nc','nz','ni','ne','ng','nu','nf','mp','no','om','pk','pw','ps','pa','pg','py','pe','ph','pn','pl','pt','pr','qa','re','ro','ru','rw','bl','sh','kn','lc','mf','pm','vc','ws','sm','st','sa','sn','rs','sc','sl','sg','sx','sk','si','sb','so','za','gs','ss','es','lk','sd','sr','se','ch','sy','tw','tj','tz','th','tl','tg','tk','to','tt','tn','tr','tm','tc','tv','ug','ua','ae','gb','us','uy','uz','vu','va','ve','vn','vg','vi','wf','eh','ye','zm','zw'
    ];
    
    const folder: string = './flags';
    
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    
    codigosISO.forEach((codigo: string) => {
        const url: string = `https://www.untitledui.com/images/flags/${codigo.toUpperCase()}.svg`;
        const file = fs.createWriteStream(`./flags/${codigo}.svg`);
        
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                setTimeout(() => {
                    console.log(`Descargado: ${codigo}.svg`);
                }, 500);
            });
        }).on('error', (err: Error) => {
            fs.unlink(`./flags/${codigo}.svg`, () => {});
            console.error(`Error con ${codigo}:`, err.message);
        });
    });
    
    res.status(200).json({ message: 'Descarga iniciada' });
});

// Use routes
app.use('/users', userRoutes);
app.use('/investments', investmentsRoute);
app.use('/instruments', instrumentsRoute);
app.use('/catalogs', catalogsRoute);

// Start server
const PORT: string | number = process.env.PORT || 3000;

// Test connection to database before starting the server
testConnection().then((connected) => {
    if (connected) {
        app.listen(PORT, () => {
            console.log(`🚀 App running on http://localhost:${PORT}`);
            console.log("📊 Base de datos Turso conectada");
        });
    } else {
        console.error("❌ No se pudo conectar a la base de datos");
        process.exit(1);
    }
});