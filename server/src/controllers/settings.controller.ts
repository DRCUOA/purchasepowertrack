import type { Request, Response } from 'express';
import type { SettingsResponse } from '@basket/shared';
import { config } from '../config.js';

export async function getSettings(_req: Request, res: Response): Promise<void> {
  const response: SettingsResponse = {
    enabled_retailers: [...config.enabledRetailers],
    baseline_month: config.baselineMonth,
    refresh_schedule: 'weekly',
    observation_rules: {
      reject_specials: true,
      reject_member_pricing: true,
      reject_multi_buy: true,
      reject_wrong_size: true,
    },
  };

  res.json(response);
}
