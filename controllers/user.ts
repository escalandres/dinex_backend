import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, response, Response } from 'express';
import { email_OTP } from "@utils/emails.ts";
import { OAuth2Client } from "google-auth-library";
import { consoleLog, generateRandomOTP } from "@utils/helpers.ts";
import { db_registrerUser, db_authenticateUser, db_changeUserPassword, db_generateOTP, db_validateOTP, db_markOTPUsed } from "@services/user.js";

// Interfaces para tipado
interface LoginRequest {
   email: string;
   password: string;
}

interface User {
   uuid: string;
   email: string;
   name: string;
   lastname: string;
   hashedPassword: string;
   profile_picture?: string;
   country: object;
}

interface Register {
   uuid: string;
   country?: object;
}

interface AuthResult {
   success: boolean;
   user?: User;
   message?: string;
}

interface JWTPayload {
   user: {
      uuid: string;
      email: string;
      name: string;
      lastname: string;
      profile_picture?: string;
      country: object;
   };
}

// Helper function para convertir datos de LibSQL
function parseUserFromDb(dbUser: any): User {
   return {
      uuid: String(dbUser.uuid),
      email: String(dbUser.email),
      name: String(dbUser.name),
      lastname: String(dbUser.lastname),
      hashedPassword: String(dbUser.hashedPassword),
      profile_picture: String(dbUser.profile_picture),
      country: Object(dbUser.country)
   };
}

function parseRegisterFromDb(dbUser: any): Register {
   return {
      uuid: String(dbUser.uuid),
      country: Object(dbUser.country)
   };
}

export async function login(req: Request, res: Response): Promise<Response> {
   try {
      // Validar que req.body existe y tiene la estructura correcta
      const body = req.body as any;
      
      if (!body || typeof body !== 'object') {
         return res.status(400).json({
            success: false,
            message: "Invalid request body"
         });
      }

      const { email, password } = body;

      // Validar que email y password estén presentes
      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: "Email and password are required"
         });
      }

      // Validar tipos
      if (typeof email !== 'string' || typeof password !== 'string') {
         return res.status(400).json({
            success: false,
            message: "Email and password must be strings"
         });
      }
      
      // Asumiendo que esta función retorna AuthResult
      const result = await db_authenticateUser(email);
      
      if (!result || !result.success) {
         return res.status(404).json({ 
            success: false, 
            message: "The user does not exist" 
         });
      }
      
      if (!result.user) {
         return res.status(404).json({ 
         success: false, 
         message: "User data not found" 
         });
      }
      
      const userData = parseUserFromDb(result.user);
      if (!bcrypt.compareSync(password, userData.hashedPassword)) {
         return res.status(404).json({
            success: false,
            message: "The password is invalid"
         });
      }
      
      // Verificar que la clave JWT existe
      const jwtSecret = process.env.KEY;
      if (!jwtSecret) {
         throw new Error('JWT secret key not configured');
      }
      
      // Crear payload del JWT
      const payload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            profile_picture: userData.profile_picture,
            country: userData.country
         }
      };
      
      // Generar token
      const token: string = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({ 
         success: true, 
         token: token 
      });
      
   } catch (error) {
      console.error('Ocurrió un error:', error);
      return res.status(401).json({ 
         success: false,
         message: 'Authentication failed'
      });
   }
}

export async function signup(req: Request, res: Response): Promise<Response> {
   try {
      // Validar que req.body existe y tiene la estructura correcta
      const body = req.body as any;
      if (!body || typeof body !== 'object') {
         return res.status(400).json({
            success: false,
            message: "Invalid request body"
         });
      }

      const { email, password, name, lastname, country } = body;

      // Validar que email y password estén presentes
      if (!email || !password || !name || !lastname || !country) {
         return res.status(400).json({
            success: false,
            message: "Email, password, name, lastname and country are required"
         });
      }

      // Validar tipos
      if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || typeof lastname !== 'string' || typeof country !== 'number') {
         return res.status(400).json({
            success: false,
            message: "Email, password, name, lastname must be strings, and country must be a number"
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let user = {
         email: email, name: name, lastname: lastname, 
         password: hashedPassword, country: country, 
         profile_picture: ""
      }

      const response = await db_registrerUser(user);

      if (!response || !response.userId || !response.country) {
         return res.status(404).json({ 
            success: false, 
            message: "Error al crear su cuenta de usuario. Inténtelo nuevamente" 
         });
      }

      const userData = parseRegisterFromDb(response);

      // Verificar que la clave JWT existe
      const jwtSecret = process.env.KEY;
      if (!jwtSecret) {
         throw new Error('JWT secret key not configured');
      }
      
      // Crear payload del JWT
      const payload: JWTPayload = {
         user: {
            uuid: userData.uuid,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            profile_picture: user.profile_picture,
            country: userData.country
         }
      };

      // Generar token
      const token: string = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({
         token: token 
      });

   } catch (error) {
      console.error('Ocurrio un error:',error);
      return res.status(400).json({ error: "Error al crear su cuenta de usuario. Inténtelo nuevamente" });
   }
}

export async function logout(req,res){
   // Destruir la sesión y redirigir a la página de inicio de sesión
   req.session.destroy((err) => {
      if (err) {
         console.error('Error al destruir la sesión:', err);
         return res.status(500).json({success: false, message: "Ha ocurrido un error con su petición. Inténtelo nuevamente"})
      }
      res.clearCookie('AuthToken');
      return res.status(200).json({success: true})
   });
}

export async function changeUserPassword(req: Request, res: Response): Promise<Response> {
   try {
      consoleLog("-----Cambiando contraseña-----");
      const { password, uuid } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const response = await db_changeUserPassword(uuid, hashedPassword)

      if (!response) {
         return res.status(401).json({ success: false, message: "No se pudo actualizar la contraseña" })
      }
      return res.status(200).json({ success: true })
   } catch (error) {
      console.error(error);
      // Enviar respuesta JSON indicando fallo
      res.status(401).json({ success: false });
   }
}

export async function generateOTP(req: Request, res: Response): Promise<Response> {
   try {
      const email = req.body.email;
      if (!email) return res.status(400).json({ success: false, message: "Email is required" });

      const otp = generateRandomOTP();
      const dbResponse = await db_generateOTP(email, otp)
      if (!dbResponse) return res.status(401).json({ success: false, messageCode: "No se pudo generar el código OTP. Inténtelo nuevamente" });

      const emailResponse = await email_OTP(email, dbResponse.otp)
      if (!emailResponse) return res.status(401).json({ success: false, message: "Error al generar código OTP. Inténtelo nuevamente" })

      const token = jwt.sign({ uuid: dbResponse.uuid, email: email }, process.env.KEY, { expiresIn: '30m' });

      return res.status(200).json({ success: true, token: token });
   } catch (error) {
      console.error(error);
      res.status(401).json({ success: false });
   }
}

export async function validateOTP(req: Request, res: Response): Promise<Response> {
   try {
      const { otp } = req.body;
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Extrae el token después de "Bearer"

      if (!token) {
      return res.status(401).json({ success: false, message: "Token no proporcionado" });
      }

      const payload = jwt.verify(token, process.env.KEY)  as JWTPayload;

      const dbResponse = await db_validateOTP(payload.user.email, otp)
      if (!dbResponse) return res.status(401).json({ success: false, message: "Error al crear su cuenta de usuario. Inténtelo nuevamente" })

      const now = new Date();
      if (Date.now() < Number(dbResponse.expiration)) return res.status(401).json({ success: false, message: "El código de seguridad ha expirado. Inténtelo nuevamente" })
      if (otp !== dbResponse.otp) return res.status(401).json({ success: false, message: "El código de seguridad ingresado es incorrecto" })

      await db_markOTPUsed(dbResponse.userId, otp);
      return res.status(200).json({ success: true });
   } catch (error) {
      console.error(error);
      // Enviar respuesta JSON indicando fallo
      res.status(401).json({ success: false });
   }
}

// export async function googleAuth(req: Request, res: Response): Promise<Response> {
//    try {
//       consoleLog("-------------Autenticando con Google-------------");
//       const oAuth2Client = new OAuth2Client(
//          process.env.GOOGLE_CLIENT_ID,
//          process.env.GOOGLE_CLIENT_SECRET,
//          'postmessage',
//       );
//       // Configura el token de acceso
//       oAuth2Client.setCredentials({
//          access_token: req.body.oauth
//       });

//       // Realiza una solicitud a la API de Google para obtener la información del usuario
//       const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
//       const googleResponse = await oAuth2Client.request({ url });
//       const userInfoGoogle = googleResponse.data;
//       // Imprime la información del usuario
//       //consoleLog("user google", userInfoGoogle);
//       const response = await db_authGoogle(userInfoGoogle);
//       if(!response.success){
//          return res.status(401).json({success: false, message: "Error al crear su cuenta de usuario. Inténtelo nuevamente"})
//       }
//       // Agregar una cookie con JWT para autenticar a los usuarios
//       const token = jwt.sign({ user: {
//          id: response.user.id,
//          email: response.user.email,
//          name: response.user.name,
//          profile_picture: response.user.profile_picture
//       }}, process.env.KEY, { expiresIn: '1h' });
//       return res.status(200).json({success: true, token: token})
//    } catch (error) {
//       console.error('Ocurrio un error:',error);
//       // Enviar respuesta JSON indicando fallo
//       return res.status(401).json({ success: false });
//    }
// }

// export async function githubAuth(req: Request, res: Response): Promise<Response> {
//    try {
//       consoleLog("-------------Autenticando con GitHub-------------");
//       const code = req.body.code;
//       // consoleLog("------code",code)
//       const githubToken = await getGithubToken(code);
//       if(githubToken === undefined) return res.status(401).json({ success: false });
//       ///consoleLog("githubToken",githubToken)
//       const githubUser = await getGithubUser(githubToken);
//       //consoleLog("githubUser",githubUser)
//       const response = await db_authGithub(githubUser);
//       // const result = await getUser(oauth.email)

//       if(!response.success){
//          return res.status(404).json({success: false, message: "The user does not exist"})
//       }
//       // if(!bcrypt.compareSync(password, result.user.password)) {
//       //     return res.status(404).json({success: false, message: "The password is invalid"})
//       // }
//       // // Agregar una cookie con JWT para autenticar a los usuarios   
//       const token = jwt.sign({ user: {
//          id: response.user.id,
//          email: response.user.email,
//          name: response.user.name,
//          profile_picture: response.user.profile_picture
//       }}, process.env.KEY, { expiresIn: '1h' });
//       // consoleLog("token",token);
//       // res.cookie('AuthToken', token, { maxAge: 3 * 24 * 60 * 60 * 1000 });
//       //req.session.user = { id: result.user.id, email: result.user.email };
//       return res.status(200).json({ success: true, token: token });
//    } catch (error) {
//       console.error('Ocurrio un error:',error);
//       // Enviar respuesta JSON indicando fallo
//       res.status(401).json({ success: false });
//    }
// }

// // Extra functions

// async function getGithubToken(code){
//    let token = '';
//    const params = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`;
//    //consoleLog("-------params",params);
//    await fetch(`https://github.com/login/oauth/access_token${params}`, {
//       method: 'POST',
//       headers: {
//          'Accept': 'application/json'
//       }
//    }).then((response) => { 
//       return response.json()
//    }).then((data) => {
//       //consoleLog(data)
//       consoleLog("getGithubToken",data.access_token);
//       token = data.access_token;
//    }).catch((error) => {
//       console.error('Error:', error);
//    })
//    return token;
// }

// async function getGithubUser(token){
//    let user = {};
//    await fetch(`https://api.github.com/user`, {
//       method: 'GET',
//       headers: {
//          'Authorization': `Bearer ${token}`
//       }
//    }).then((response) => {
//       return response.json()
//    }).then((data) => {
//       consoleLog("user", data)
//       user = data;
//    }).catch((error) => {
//       console.error('Error:', error);
//    })
//    return user;
// }