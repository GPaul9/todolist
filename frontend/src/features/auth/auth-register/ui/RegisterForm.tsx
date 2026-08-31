import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Button, ConsentPersonalData, Input, PasswordInput, PasswordStrength, PrivacyPolicyLink } from 'shared/ui';

import { usePasswordValidation, forbiddenChars } from '../lib/usePasswordValidation';
import { registerSchema, RegisterFormData } from '../model/types';
import { useRegisterForm } from '../model/useRegisterForm';

import styles from './RegisterForm.module.scss';

export const RegisterForm = () => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid: isFormValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = useWatch({ control, name: 'password' }) || '';
  const confirmPasswordValue = useWatch({ control, name: 'repeat_password' }) || '';
  const { strengthScore, isValid: isPasswordStrong } = usePasswordValidation(passwordValue);

  const { mutate: registerUser, isPending } = useRegisterForm();

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      ...data,
      email: data.email.toLowerCase(),
    },
    {
      onError: (err: any) => {
        const detail = JSON.stringify(err.response?.data).toLowerCase();

        if (err.response?.status === 409 || detail.includes('exists')) {
          setError('email', {
            type: 'server',
            message: 'Пользователь с таким email уже существует',
          });
        }
      },
    });
  };

  const currentPasswordStatus = (() => {
    if (!passwordValue) {
      return errors.password ? 'error' : 'default';
    }

    const hasHardPasswordError = passwordValue.length > 100 || forbiddenChars.test(passwordValue);

    if (hasHardPasswordError) {
      return 'error';
    }

    if (isPasswordStrong) {
      return errors.password ? 'error' : 'success';
    }
    if (strengthScore >= 3) return 'warning';

    if (errors.password) return 'error';

    return 'default';
  })();

  const passwordClass = {
    success: styles.isSuccess,
    warning: styles.isMedium,
    error: styles.isError,
    default: '',
  }[currentPasswordStatus];

  return (
    <form className={styles.register} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.register__names}>
        <Input
          label="Имя"
          placeholder="Имя"
          {...register('first_name')}
          status={errors.first_name ? 'error' : 'default'}
          errorMessage={errors.first_name?.message}
        />
        <Input
          label="Фамилия"
          placeholder="Фамилия"
          {...register('last_name')}
          status={errors.last_name ? 'error' : 'default'}
          errorMessage={errors.last_name?.message}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="Адрес электронной почты"
        {...register('email')}
        helpText="Пример email: name@example.com"
        status={errors.email ? 'error' : 'default'}
        errorMessage={errors.email?.message}
        autoComplete="email"
      />

      <div className={`${styles.register__password} ${passwordClass}`}>
        <PasswordInput
          label="Пароль"
          placeholder="Пароль"
          {...register('password', {
            deps: ['repeat_password'],
          })}
          status={currentPasswordStatus}
          errorMessage={errors.password?.message}
          strengthSpace={
            passwordValue && (
              <div className={styles.register__strength}>
                <PasswordStrength score={strengthScore} onlyBar />
                <PasswordStrength score={strengthScore} onlyText />
              </div>
            )
          }
        />
        {!passwordValue && (
          <p className={styles.register__symbols}>
            Пароль из 12 символов и должен содержать: (A–Z), (a–z), (0–9), специальный символ.
            Запрещены: ’ “ \ / ; – # &lt; &gt; &amp; @
          </p>
        )}
      </div>

      <PasswordInput
        label="Повторить пароль"
        placeholder="Пароль"
        {...register('repeat_password')}
        status={
          errors.repeat_password && confirmPasswordValue
            ? 'error'
            : !errors.repeat_password &&
                confirmPasswordValue &&
                confirmPasswordValue === passwordValue &&
                !errors.password
              ? 'success'
              : 'default'
        }
        errorMessage={confirmPasswordValue ? errors.repeat_password?.message : ''}
      />

      <div className={styles.checkboxes}>
        <div className={styles.checkboxes__item}>
          <label className={styles.checkboxes__label}>
            <input
              className={styles.checkboxes__input}
              type="checkbox"
              {...register('consent_personal_data')}
            />
            <span className={styles.checkboxes__text}>
              Согласен с <ConsentPersonalData />
            </span>
          </label>
          <div className={styles.checkboxes__info}>
            {errors.consent_personal_data && (
              <span className={styles.checkboxes__message}>
                {errors.consent_personal_data.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.checkboxes__item}>
          <label className={styles.checkboxes__label}>
            <input
              className={styles.checkboxes__input}
              type="checkbox"
              {...register('privacy_policy_agreement')}
            />
            <span className={styles.checkboxes__text}>
              Согласен с <PrivacyPolicyLink />
            </span>
          </label>
          <div className={styles.checkboxes__info}>
            {errors.privacy_policy_agreement && (
              <span className={styles.checkboxes__message}>
                {errors.privacy_policy_agreement.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        className={styles.register__btn}
        kind="primary"
        type="submit"
        disabled={!isFormValid || !isPasswordStrong}
        isLoading={isPending}
      >
        Зарегистрироваться
      </Button>
    </form>
  );
};
