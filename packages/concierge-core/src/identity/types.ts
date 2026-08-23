export interface ExternalIdentityLink {
  id: string;
  provider: 'slack' | 'discord';
  externalTenantId: string; // Slack team_id or Discord guild_id
  externalUserId: string;
  internalUserId?: string;
  organizationId?: string;
  defaultProjectScope: string;
  status: 'unlinked' | 'pending' | 'linked' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface IdentityResolver {
  resolve(provider: string, externalTenantId: string, externalUserId: string): Promise<ExternalIdentityLink>;
  createPendingLink(
    provider: string,
    externalTenantId: string,
    externalUserId: string
  ): Promise<ExternalIdentityLink>;
  linkIdentity(
    provider: string,
    externalTenantId: string,
    externalUserId: string,
    internalUserId: string,
    organizationId?: string
  ): Promise<ExternalIdentityLink>;
}
