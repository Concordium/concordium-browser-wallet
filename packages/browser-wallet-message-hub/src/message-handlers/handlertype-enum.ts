/**
 * Enumeration of the different types of scripts which are either sending or receiving messages
 */
export enum HandlerTypeEnum {
    InjectedScript = 'InjectedScript',
    ContentScript = 'ContentScript',
    PopupScript = 'PopupScript',
    BackgroundScript = 'BackgroundScript',
}
