import { ConfigService } from '@nestjs/config';
export const jwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('SEC_TKN', 'secret_key_default'),
  refresh_secret: configService.get<string>(
    'SEC_REF_TKN',
    'refresh_key_default',
  ),
  signOptions: { expiresIn: configService.get<string>('SEC_TKN_EXP') },
});
