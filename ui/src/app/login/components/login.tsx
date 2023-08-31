import {FormField} from 'argo-ui';
import React, {useState, useEffect, useContext} from 'react';
import {Form, Text} from 'react-form';
import {Context} from '../../shared/context';
import {AuthSettings} from '../../shared/models';
import {services} from '../../shared/services';
import {Location} from 'history';

require('./login.scss');

export interface LoginForm {
    username: string;
    password: string;
}

export const LoginFactory: (
    settings: () => Promise<AuthSettings>,
    userLogin: (userName: string, password: string) => Promise<{token: string}>
) => React.FC<{history: {location: Location}}> = (settings, userLogin) => props => {
    const appContext = useContext(Context);

    const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loginInProgress, setLoginInProgress] = useState<boolean>(false);
    const [returnUrl, setReturnUrl] = useState<string>('');
    const [hasSsoLoginError, setHasSsoLoginError] = useState<boolean>(false);
    const ssoConfigured = authSettings && ((authSettings.dexConfig && (authSettings.dexConfig.connectors || []).length > 0) || authSettings.oidcConfig);

    useEffect(() => {
        const fetchAuthSettings = async () => {
            setAuthSettings(await settings());
        };
        fetchAuthSettings();

        const search = new URLSearchParams(props.history.location.search);
        setReturnUrl(search.get('return_url') || '');
        setHasSsoLoginError(search.get('has_sso_error') === 'true');
    }, [props.history.location.search]);

    const login = async (username: string, password: string, returnURL: string) => {
        try {
            setLoginError('');
            setLoginInProgress(true);
            appContext.navigation.goto('.', {sso_error: null});
            await userLogin(username, password);
            setLoginInProgress(false);
            if (returnURL) {
                const url = new URL(returnURL);
                appContext.navigation.goto(url.pathname + url.search);
            } else {
                appContext.navigation.goto('/applications');
            }
        } catch (e) {
            setLoginError(e.response.body.error);
            setLoginInProgress(false);
        }
    };

    return (
        <div className='login'>
            <div className='login__content show-for-medium'>
                <div className='login__text'>Let's get stuff deployed!</div>
                <div className='argo__logo' />
            </div>
            <div className='login__box'>
                <div className='login__logo width-control'>
                    <img className='logo-image' src='assets/images/argo_o.svg' alt='argo' />
                </div>
                {ssoConfigured && (
                    <div className='login__box_saml width-control'>
                        <a href={`auth/login?return_url=${encodeURIComponent(returnUrl)}`}>
                            <button className='argo-button argo-button--base argo-button--full-width argo-button--xlg'>
                                {(authSettings.oidcConfig && <span>Log in via {authSettings.oidcConfig.name}</span>) ||
                                    (authSettings.dexConfig.connectors.length === 1 && <span>Log in via {authSettings.dexConfig.connectors[0].name}</span>) || (
                                        <span>SSO Login</span>
                                    )}
                            </button>
                        </a>
                        {hasSsoLoginError && <div className='argo-form-row__error-msg'>Login failed.</div>}
                        {authSettings && !authSettings.userLoginsDisabled && (
                            <div className='login__saml-separator'>
                                <span>or</span>
                            </div>
                        )}
                    </div>
                )}
                {authSettings && !authSettings.userLoginsDisabled && (
                    <Form
                        onSubmit={(params: LoginForm) => login(params.username, params.password, returnUrl)}
                        validateError={(params: LoginForm) => ({
                            username: !params.username && 'Username is required',
                            password: !params.password && 'Password is required'
                        })}>
                        {formApi => (
                            <form role='form' className='width-control' onSubmit={formApi.submitForm}>
                                <div className='argo-form-row'>
                                    <FormField formApi={formApi} label='Username' field='username' component={Text} componentProps={{autoCapitalize: 'none'}} />
                                </div>
                                <div className='argo-form-row'>
                                    <FormField formApi={formApi} label='Password' field='password' component={Text} componentProps={{type: 'password'}} />
                                    {loginError && <div className='argo-form-row__error-msg'>{loginError}</div>}
                                </div>
                                <div className='login__form-row'>
                                    <button disabled={loginInProgress} className='argo-button argo-button--full-width argo-button--xlg' type='submit'>
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        )}
                    </Form>
                )}
                {authSettings && authSettings.userLoginsDisabled && !ssoConfigured && (
                    <div className='argo-form-row__error-msg'>Login is disabled. Please contact your system administrator.</div>
                )}
                <div className='login__footer'>
                    <a href='https://argoproj.io' target='_blank'>
                        <img className='logo-image' src='assets/images/argologo.svg' alt='argo' />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginFactory(
    () => services.authService.settings(),
    (userName, password) => services.users.login(userName, password)
);
