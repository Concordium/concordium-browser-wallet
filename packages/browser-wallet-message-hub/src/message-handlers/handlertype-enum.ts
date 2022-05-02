/**
 * Enumeration of the different types of scripts which are either sending or receiving messages
 */
export enum HandlerTypeEnum {
    injectedScript = 'injectedScript',
    contentScript = 'contentScript',
    popupScript = 'popupScript',
    backgroundScript = 'backgroundScript',
}
