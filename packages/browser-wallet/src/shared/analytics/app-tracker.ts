import { v4 as uuidv4 } from 'uuid';
import { storedAcceptedActivityTracking, storedCurrentNetwork } from '@shared/storage/access';
import { isMainnet } from '@shared/utils/network-helpers';

const MEASUREMENT_ID = 'G-59MQ3V5F8J';
const API_SECRET = 'dUPokDfQTX69fM0H5N8WgQ';

type EventParams = { [key: string]: string };
const logEvent = async (eventName: string, eventParams: EventParams) => {
    const activityTracking = await storedAcceptedActivityTracking.get();
    const network = await storedCurrentNetwork.get();

    if (!activityTracking || !network) {
        return;
    }

    if (!activityTracking?.accepted || !isMainnet(network)) {
        return;
    }

    await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
            method: 'POST',
            body: JSON.stringify({
                client_id: activityTracking.clientId,
                user_id: activityTracking.userId,
                events: [
                    {
                        name: eventName,
                        params: {
                            session_id: activityTracking.sessionId,
                            ...eventParams,
                        },
                    },
                ],
            }),
        }
    );
};

const FirebaseAnalytics = {
    Event: {
        SCREEN_VIEW: 'screen_view',
        SELECT_CONTENT: 'select_content',
        ENTER_INPUT: 'enter_input',
        HOME_ID_VERIFICATION_STATE_CHANGE: 'home_id_verification_state_change',
    },
    Param: {
        SCREEN_NAME: 'screen',
        SCREEN_CLASS: 'screen_class',
        ITEM_NAME: 'item_list_name',
        CONTENT_TYPE: 'content_type',
    },
};

const CONTENT_TYPE_CHECK_BOX = 'checkbox';
const CONTENT_TYPE_BUTTON = 'button';
const CONTENT_TYPE_BANNER = 'banner';
const CONTENT_TYPE_LABEL = 'label';
const CONTENT_TYPE_LINK = 'link';

type AppScreen = { title: string; slug: string };
const appScreen = (title: string, slug: string): AppScreen => ({ title, slug });

const SCREEN_WELCOME = appScreen('Welcome', 'welcome');
const SCREEN_PASSCODE_SETUP = appScreen('Passcode setup', 'passcode_setup');
const SCREEN_PHRASE_SETUP = appScreen('Seed phrase setup', 'phrase_setup');
const SCREEN_ID_PROVIDERS = appScreen('ID Providers', 'id_providers');
const SCREEN_ID_VERIFICATION = appScreen('ID Verification', 'id_verification');
const SCREEN_ID_VERIFICATION_RESULT = appScreen('ID Verification result', 'id_verification_result');
const SCREEN_HOME = appScreen('Home', 'home');
const SCREEN_ONRAMP = appScreen('Onramp', 'onramp');
const SCREEN_ABOUT = appScreen('About', 'about');
const SCREEN_DISCOVER = appScreen('Discover', 'discover');

const DIALOG_SET_UP_WALLET = appScreen('Set up wallet dialog', 'set_up_wallet_dialog');
const DIALOG_ID_VERIFICATION_APPROVED = appScreen('ID Verification approved', 'id_verification_approved_dialog');
const DIALOG_UNLOCK_FEATURE = appScreen('Home: Unlock feature dialog', 'unlock_feature_dialog');

type AnalyticsTrackingObject = {
    accepted: boolean;
    clientId: string;
    userId: string;
    sessionId: number;
};

class FirebaseAppTracker {
    private screenVisit(screen: AppScreen, extraParams?: { [key: string]: string }) {
        logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, {
            [FirebaseAnalytics.Param.SCREEN_NAME]: screen.title,
            [FirebaseAnalytics.Param.SCREEN_CLASS]: screen.slug,
            ...extraParams,
        });
    }

    private contentSelection(contentName: string, contentType: string) {
        logEvent(FirebaseAnalytics.Event.SELECT_CONTENT, {
            [FirebaseAnalytics.Param.ITEM_NAME]: contentName,
            [FirebaseAnalytics.Param.CONTENT_TYPE]: contentType,
        });
    }

    private input(contentName: string) {
        logEvent(FirebaseAnalytics.Event.ENTER_INPUT, {
            [FirebaseAnalytics.Param.ITEM_NAME]: contentName,
        });
    }

    getDateTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }

    createAnalyticsTrackingObject(accepted: boolean): AnalyticsTrackingObject {
        const currentTimestamp = this.getDateTimestamp();

        // GA's requirements for client_id: XXXXXXXX.YYYYYYYYYY
        // Two part string
        // XXXXXXXX = Random integer representing the GA account/device ID
        // YYYYYYYYYY = Timestamp (in Unix epoch format, seconds) representing when the client first visited
        const generateClientId = () => {
            const getRandomValue = () => Math.floor(Math.random() * 1e10);
            return `${getRandomValue()}.${currentTimestamp}`;
        };

        return {
            accepted,
            clientId: generateClientId(),
            userId: `user_${uuidv4()}`,
            sessionId: currentTimestamp,
        };
    }

    welcomeScreen() {
        this.screenVisit(SCREEN_WELCOME);
    }

    welcomeTermAndConditionsCheckBoxChecked() {
        this.contentSelection('Terms and Conditions check box', CONTENT_TYPE_CHECK_BOX);
    }

    welcomeActivityTrackingCheckBoxChecked() {
        this.contentSelection('Activity Tracking check box', CONTENT_TYPE_CHECK_BOX);
    }

    welcomeGetStartedClicked() {
        this.contentSelection('Get started', CONTENT_TYPE_BUTTON);
    }

    welcomeSetUpWalletDialog() {
        this.screenVisit(DIALOG_SET_UP_WALLET);
    }

    welcomeSetUpWalletDialogCreateClicked() {
        this.contentSelection('Create wallet', CONTENT_TYPE_BUTTON);
    }

    welcomeSetUpWalletDialogImportClicked() {
        this.contentSelection('Import wallet', CONTENT_TYPE_BUTTON);
    }

    passcodeScreen() {
        this.screenVisit(SCREEN_PASSCODE_SETUP);
    }

    passcodeSetupEntered() {
        this.input('6-digit passcode');
    }

    passcodeSetupConfirmationEntered() {
        this.input('6-digit passcode confirmation');
    }

    seedPhraseScreen() {
        this.screenVisit(SCREEN_PHRASE_SETUP);
    }

    seedPhraseCopyClicked() {
        this.contentSelection('Phrase copy to clipboard', CONTENT_TYPE_BUTTON);
    }

    seedPhraseCheckboxBoxChecked() {
        this.contentSelection('I backed up my seed phrase', CONTENT_TYPE_CHECK_BOX);
    }

    seedPhraseContinueClicked() {
        this.contentSelection('Phrase continue', CONTENT_TYPE_BUTTON);
    }

    identityVerificationProvidersListScreen() {
        this.screenVisit(SCREEN_ID_PROVIDERS);
    }

    identityVerificationScreen(provider: string) {
        this.screenVisit(SCREEN_ID_VERIFICATION, { provider });
    }

    identityVerificationResultScreen() {
        this.screenVisit(SCREEN_ID_VERIFICATION_RESULT);
    }

    identityVerificationResultApprovedDialog() {
        this.screenVisit(DIALOG_ID_VERIFICATION_APPROVED);
    }

    identityVerificationResultCreateAccountClicked() {
        this.contentSelection('Identity verification create account', CONTENT_TYPE_BUTTON);
    }

    homeScreen() {
        this.screenVisit(SCREEN_HOME);
    }

    homeSaveSeedPhraseClicked() {
        this.contentSelection('Home save seed phrase', CONTENT_TYPE_BUTTON);
    }

    homeIdentityVerificationClicked() {
        this.contentSelection('Home verify identity', CONTENT_TYPE_BUTTON);
    }

    homeIdentityVerificationStateChanged(state: string) {
        logEvent(FirebaseAnalytics.Event.HOME_ID_VERIFICATION_STATE_CHANGE, { state });
    }

    homeCreateAccountClicked() {
        this.contentSelection('Home create account', CONTENT_TYPE_BUTTON);
    }

    homeOnrampScreen() {
        this.screenVisit(SCREEN_ONRAMP);
    }

    homeOnrampSiteClicked(siteName: string) {
        this.contentSelection(`Onramp ${siteName}`, CONTENT_TYPE_BUTTON);
    }

    homeOnrampBannerClicked() {
        this.contentSelection('Onramp banner', CONTENT_TYPE_BANNER);
    }

    homeUnlockFeatureDialog() {
        this.screenVisit(DIALOG_UNLOCK_FEATURE);
    }

    homeTotalBalanceClicked() {
        this.contentSelection('Wallet total balance', CONTENT_TYPE_LABEL);
    }

    aboutScreen() {
        this.screenVisit(SCREEN_ABOUT);
    }

    aboutScreenLinkClicked(url: string) {
        this.contentSelection(`About: ${url}`, CONTENT_TYPE_LINK);
    }

    discoverScreen() {
        this.screenVisit(SCREEN_DISCOVER);
    }
}

const appTracker = new FirebaseAppTracker();

export { appTracker };
