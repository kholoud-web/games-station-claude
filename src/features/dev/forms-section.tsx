'use client';

import { useTranslations } from 'next-intl';
import { useId, type ComponentProps } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/shared/password-input';
import { PhoneInput } from '@/components/shared/phone-input';
import { SearchInput } from '@/components/shared/search-input';

import { Example, ShowcaseSection } from './section';

const LABEL = 'text-sm font-semibold text-text';

function Field({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className={LABEL}>
      {label}
    </label>
  );
}

function CheckRow({ label, ...props }: { label: string } & ComponentProps<typeof Checkbox>) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 text-sm text-text">
      <Checkbox id={id} {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export function FormsSection() {
  const tv = useTranslations('validation');
  const ids = { email: useId(), error: useId(), message: useId(), off: useId(), pw: useId(), phone: useId() };

  return (
    <ShowcaseSection title="Form fields">
      <Example label="Default">
        <div className="space-y-2">
          <Field label="Email" htmlFor={ids.email} />
          <Input id={ids.email} type="email" placeholder="gamer@domain.com" />
        </div>
      </Example>
      <Example label="Error (message is tied to the field)">
        <div className="space-y-2">
          <Field label="Email with an error" htmlFor={ids.error} />
          <Input id={ids.error} type="email" defaultValue="nope" invalid aria-describedby={ids.message} />
          <p id={ids.message} className="text-sm text-error">
            {tv('emailInvalid')}
          </p>
        </div>
      </Example>
      <Example label="Disabled">
        <div className="space-y-2">
          <Field label="Disabled field" htmlFor={ids.off} />
          <Input id={ids.off} disabled defaultValue="Not editable" />
        </div>
      </Example>
      <Example label="Password with visibility toggle">
        <div className="space-y-2">
          <Field label="Password" htmlFor={ids.pw} />
          <PasswordInput id={ids.pw} defaultValue="NeonValkyrie99!" />
        </div>
      </Example>
      <Example label="Egyptian mobile number">
        <div className="space-y-2">
          <Field label="Mobile number" htmlFor={ids.phone} />
          <PhoneInput id={ids.phone} placeholder="1012345678" />
        </div>
      </Example>
      <Example label="Search">
        <SearchInput placeholder="Search hardware, games, accessories..." />
      </Example>
      <Example label="Checkbox (24px target)">
        <div className="space-y-3">
          <CheckRow label="Checked" defaultChecked />
          <CheckRow label="Unchecked" />
          <CheckRow label="Disabled" disabled />
        </div>
      </Example>
    </ShowcaseSection>
  );
}
