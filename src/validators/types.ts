import { z } from 'zod';
import { 
    signupValidator, 
    loginValidator, 
    updateProfileValidator, 
    changePasswordValidator,
    oauthValidator,
    fileValidator
} from './user';

import { instrumentDeleteValidator, instrumentValidator } from './instruments';

// TypeScript types inferred from Validators
export type SignupData = z.infer<typeof signupValidator>;
export type LoginData = z.infer<typeof loginValidator>;
export type UpdateProfileData = z.infer<typeof updateProfileValidator>;
export type ChangePasswordData = z.infer<typeof changePasswordValidator>;
export type OAuthData = z.infer<typeof oauthValidator>;
export type FileData = z.infer<typeof fileValidator>;

export type InstrumentData = z.infer<typeof instrumentValidator>;
export type InstrumentDeleteData = z.infer<typeof instrumentDeleteValidator>;
