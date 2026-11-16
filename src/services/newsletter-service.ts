export type NewsletterSubscription = {
  status: 'subscribed';
  /** True while the service is a mock: nothing was stored or sent. The UI must say so. */
  simulated: boolean;
};

/** Contract a backend must satisfy. The email is already validated and normalized by the form. */
export interface NewsletterService {
  subscribe(email: string): Promise<NewsletterSubscription>;
}
