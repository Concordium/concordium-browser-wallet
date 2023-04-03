import type en from './en';

const t: typeof en = {
    noAccounts: 'Du har ingen konti i din wallet.',
    removeAccount: 'Fjern konto (kun lokalt)',
    resetConnections: 'Fjern forbindelser',
    accountAddress: 'Konto adresse',
    siteConnected: 'Forbundet',
    siteNotConnected: 'Ikke forbundet',
    accountBalanceError: 'Fejl ved hentning af kontoens balance',
    actions: {
        log: 'Transaktionslog',
        send: 'Send CCD',
        receive: 'Modtag CCD',
        earn: 'Optjen CCD',
        settings: 'Kontoindstillinger',
        tokens: 'Tokens',
    },
    details: {
        total: 'Offentligt total',
        atDisposal: 'Offentligt til rådighed',
        stakeAmount: 'Stake',
    },
    settings: {
        connectedSites: {
            title: 'Forbundne hjemmesider',
            noConnected: 'Den valgte konto er ikke forbundet til nogen hjemmeside.',
            connect: 'Forbind',
            disconnect: 'Fjern',
        },
        exportPrivateKey: {
            title: 'Eksportér privatnøgle',
            description: 'Indtast venligst din adgangskode for at vise din private nøgle.',
            copyDescription: 'Tryk på knappen for at kopiere din private nøgle.',
            show: 'Vis privatnøgle',
            done: 'Færdig',
            export: 'Eksporter',
        },
        accountStatement: {
            title: 'Eksportér transaktionslog',
            description:
                'Transaktionslogs for en konto kan genereres og hentes fra CCDScan.io.\n\nCCDScan er en Concordium block explorer, og ved at trykke på knappen nedenfor åbnes et denne side i din browser.',
            link: 'Gå til CCDScan.io',
        },
    },
    confirmTransfer: {
        buttons: {
            back: 'tilbage',
            send: 'Send',
            finish: 'Færdigør',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Indtast et beløb at overføre',
            recipient: 'Indtast modtager addresse',
        },
        buttons: {
            continue: 'Fortsæt',
        },
        title: 'Send CCD',
        currentBalance: 'Nuværende saldo',
        unableToCoverCost: 'Utilstrækkelig antal CCD til at dække omkostninger',
        unableToSendFailedInvoke: 'Simulering af overførsel fejlede, overførslen er ikke mulig.',
        transferInvokeFailed: 'Simulering af overførsel fejlede: {{ message }}',
        unableToCreatePayload: 'Konstruktion af transaktion fejlede: {{ message}}',
        nonexistingAccount: 'Modtager findes ikke på kæden',
        fee: 'Estimerede transaktionsomkostninger',
    },
    tokens: {
        tabBar: {
            ft: 'Ombyttelige',
            nft: 'Samlerobjekter',
            manage: 'Rediger',
        },
        add: {
            lookupTokens: 'Søg efter tokens',
            indexRequired: 'Kontrakt indeks er påkrævet',
            negativeIndex: 'Kontrakt indeks kan ikke være et negativt tal',
            indexMax: 'Kontrakt indeks må højst være 18446744073709551615',
            invalidIndex: 'Kontrakt indeks skal være et heltal',
            noContractFound: 'Ingen kontrakt fundet på indeks',
            noTokensError: 'Ingen tokens fundet i kontrakten',
            failedTokensError: 'En fejl skete under tjekket efter tokens',
            contractIndex: 'Kontrakt indeks',
            hexId: 'Ugyldigt token ID (skal være HEX encodet)',
            updateTokens: 'Opdater tokens',
            chooseContractHeader: 'Indtast et kontraktindeks til at vælge tokens fra.',
            ItemBalancePre: 'Din saldo: ',
            searchLabel: 'Søg efter token ID i {{ contractName }}',
            noValidTokenError: 'Token eksisterer enten ikke eller kan ikke vises i wallet',
            noTokensChange: 'Ingen opdateringer til tokenliste.',
            tokensChanged: 'Tokenliste opdateret.',
            missingMetadata: 'Tokens kunne ikke vises på grund af manglende metadata.',
            emptyList: 'Ingen tokens fundet.',
        },
        unownedUnique: 'Ikke ejet',
        listAddMore: 'Du kan tilføje flere tokens fra Rediger siden.',
        listEmpty: 'Du kan tilføje tokens fra Rediger siden.',
    },
    earn: {
        title: 'Fortjenester',
        description: 'Der are to måder at få fortjenester på Concordium: Baking and delegation.',
        bakingHeader: 'Baking',
        bakingDescription:
            'Som en baker deltager i netværket ved at bage blocks på Concordium netværket. Dette kræver som minimum {{ minAmount }} CCD og adgang til en dedikeret node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            'Hvis du ikke har adgang til din egen node kan du delegere dit stake til en anden baker. Det kræver ikke noget minimumsbeløb af CCD for at delegere\n\nVælg muligheden der passer dig bedst nedenfor for at lære mere.\n\nNOTE: Én konto kan ikke både være baker og delegator, men det er muligt at skifte ved at stoppe den nuværende rolle.',
        delegateCta: 'Opsæt delegation',
        bakingCta: 'Opsæt baking',
    },
    delegate: {
        registerIntro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation tillader brugere af Concordium blockchain at få fortjenester uden at være baker eller køre en node.\n\nVed at indsætte CCD på din delegation saldo kan du få fortjenester.\n\nPå de næste sider, vil vi gå igennem de basale delegation koncepter. Hvis du vil lære mere, kan du besøge vores <1>dokumentation side</1>.',
            },
            '2': {
                title: 'Delegation modeller',
                body: 'Der er to modeller man kan være til delegation. <2><3>Delegating til en specifik pulje</3><3>Passiv delegation</3></2>En baker-pulje administreres af en individuel baker, som kører en node, så fortjenesterne afhænger af bakerens ydeevne/stabilitet.\n\nPassiv delegation går ikke til en specifik pulje, hvilket gør at det mitigerer risikoen for problemer med en baker, men fortjenesterne er lavere.\n\nFor at læse mere, besøg vores <1>dokumentation side</1>.',
            },
            '3': {
                title: 'baker-puljer',
                body: 'En baker-pulje administreres af en individuel baker.\n\nAt have en pulje kan give bakeren en større stake og øge deres chance for at blive valgt til at bake en block.\n\nBakerer tjener provision fra deres delegators når de baker en block.\n\nDelegering til en pulge har normalt højere fortjeneste end passiv delegation, men der er en risiko for at tabe fortjenester hvis bakeren ikke er stabil eller oplever problemer. Det er derfor en god ide at holde øje med bakerens velbefindende.\n\nDu kan læse mere om dette på vores <1>dokumentation side</1>.',
            },
            '4': {
                title: 'Passiv delegation',
                body: 'For CCD indehavere som ikke ønske at holde øje med deres valgte puljes velbefindende, men bare vil have stabile fortjenester, så er passiv delegation et lav-risiko, lav-fortjeneste alternative.\n\nDenne strategi er ikke forbundet med en specfic baker, så der er ingen risiko ved en baker dårlige velbefindende.\n\nPassiv delegation tilbyder dog lavere fortjenester end hvad du ville kunne forvente hvis du valgt en bestemt pulje.',
            },
            '5': {
                title: 'Pay days',
                body: 'Uanset om du har valgt en bestemt baker-pulje eller passiv delegation, så bliver fortjenester betalt ud ved en pay day. Fortjenesterne er distribureret ud til alle i puljen forholdsmæssigt til deres delegation saldo, og en provision er udbetalt til bakers af alle delegators.\n\nHvis du senere ændrer dine delegationindstillinger, så vil de fleste af dem træde i kraft ved den efterfølgende pay day.\n\nFor at læse mere om en pay day, kan du besøge vores <1>dokumentation side</1>.',
            },
            '6': {
                title: 'Lock-in og cool-downs',
                body: 'Når du laver delegation, bliver din delegation saldo låst til din konto.\n\nDette betyder at du ikke kan bruge CCD fra denne saldo mens det bliver brugt til delegation.\n\nHvis du formindsker din delegation saldo eller helt stopper for delegation, vil denne saldo forblive låst i en cool-down periode. I løbet af denne cool-down periode, vil den fulde delegation saldo stadig yde fortjenester.\n\nDa transaktioner har omkostninger er det vigtigt at huske på at man behøver nogle ulåste CCD, udenfor delegation saldoen, som kan bruges til at betale omkostningerne for at frigøre delegation saldoen igen.',
            },
            '7': {
                title: 'Status siden',
                body: 'Efter at du er startet på delegation, kan du se den nuværende status på status siden.\n\nDerfra kan du også opdatere dine delegationindstillinger eller stoppe delegation igen.',
            },
        },
        updateIntro: {
            '1': {
                title: 'Updating your delegation',
                body: 'Når du opdaterer din delegation, kan du vælge at øge eller formindske din delegation saldo, ændre hvilken pulje du delegerer til og/eller hvorvidt fortjenester indsættes som delegation saldo.\n\nDu vælger selv hvor mange af parametrene du ændrer på.\n\nPå de næste sider vil vi gå igennem nogle af delegation koncepterne.',
            },
            '2': {
                title: 'Pay day opdateringer',
                body: 'Hvis du vælger at øge din delegation saldo, ændre hvilken pulje du delegerer til og/eller hvorvidt fortjenester indsættes som delegation saldo, så vil disse ændringerne tage effekt fra den næste pay day.\n\nDette vil typisk være indenfor 24 timer, men kan tage op til 25 timer.',
            },
            '3': {
                title: 'Opdateringer med længere cool-downs',
                body: 'Hvis du vælger at formindske din delegation saldo, så vil ændringen træde i kraft efter en cool-down periode.\n\nI løbet af denne cool-down periode, vil delegation saldoen være låst og kan ikke ændres, og du vil ikke kunne stoppe delegation.\n\nDu vil stadig få fortjenester i cool-down perioden, og du vil stadig kunne ændre andre delegationindstillinger.n\n.Hvis du laver andre ændringer samtidigt med at du formindsker delegation saldoen, vil disse ændringer træde i kraft ved den næste pay day, som beskrevet på sidste side.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop delegation',
                body: 'Hvis du vælger at stoppe delegation, så er der en længere cool-down periode.\n\nMens man er i en  cool-down periode fortsætter man må at gå fortjenester.\n\nI slutningen af cool-down perioden bliver det delegeret CCD låst op på din offentlige saldo, og kan bruges igen.',
            },
            '2': {
                title: 'Opdateringer i en cool-down periode',
                body: 'Kun din delegation saldo er låst i en cool-down periode.\n\nDu kan derfor stadig ændre hvilken pulje du delegerer til og/eller hvorvidt fortjenester indsættes som delegation saldo.',
            },
        },
        details: {
            heading: 'Din delegation er registreret',
            target: 'Target',
            targetPassive: 'Passiv delegation',
            targetBaker: 'Baker {{bakerId}}',
            restake: 'Fortjenester vil blive ',
            optionRestake: 'Lagt til delegation saldo',
            optionNoRestake: 'Lagt til din offentligte saldo',
            updateDelegation: 'Opdater',
            stopDelegation: 'Stop',
            pending: 'Der ventes på at transaktionen bliver finalized',
            failed: 'Transaktionen fejlede',
        },
        register: {
            title: 'Registrer delegation',
        },
        update: {
            title: 'Opdater delegation',
            noChanges:
                'Transaktionen indeholder ikke nogen ændringer i forhold til de nuværende delegationindstillinger.',
        },
        configure: {
            pool: {
                description1:
                    'Du kan delegere til en vilkårlig åben baker-pulje, eller du kan delegere med Passiv delegation',
                optionBaker: 'Baker',
                optionPassive: 'Passiv',
                descriptionBaker:
                    'Hvis du ikke allerede ved hvilke baker-pulje du vil delegere til, kan du læse mere på vores <1>dokumentation side</1>',
                descriptionPassive:
                    'Passiv delegation er et alternativ til delegation til en specifik bager pulje, men har lavere fortjenester. Med passiv delegation behøver du ikke bekymre om dig om oppetiden eller kvaliteten af baker noden.\n\nFor mere info, kan du besøge vores <1>dokumentation side</1>',
                bakerIdLabel: 'Baker ID',
                bakerIdRequired: 'Du skal specificere et baker ID',
                targetNotOpenForAll: 'Valgt baker tillader ikke nye delegators',
                currentStakeExceedsCap: 'Din nuværende delegation saldo overtræder den valgte bakers loft',
                chosenStakeExceedsCap: 'Den valgte delegation saldo  overtræder bakerens loft',
                notABaker: 'Det medgivne baker ID svarer ikke til en aktiv baker',
            },
            amount: {
                description: 'Indtast din ønskede delegation saldo',
                amountLabel: 'Delegation saldo',
                amountRequired: 'Du skal specificere en delegation saldo',
                optionRedelegate: 'Ja, indsæt',
                optionNoRedelegate: 'Nej, indsæt ikke',
                descriptionRedelegate:
                    'Vil du gerne automatisk indsætte dine fortjenester på din delegation saldo?\n\nHvis du vælger ikke at indsætte dine fortjenester, vil de blive tilføjet til din offentlige saldo hver pay day.',
                locked: 'Saldo låst',
                lockedNote: 'Du kan ikke ændre saldoen mens der er en kommende ændring',
                overStakeThresholdWarning:
                    'Du er ved at låse mere end {{ threshold }}% af din totale saldo som din delegation saldo.\n\nHvis du ikke har nok ulåste CCD, vil du ikke kunne betale for transaktionsomkostninger.',
                enterNewStake: 'Indtast ny delegation saldo',
            },
            continueButton: 'Fortsæt',
            warning: 'Advarsel',
        },
    },
    baking: {
        registerIntro: {
            '1': {
                title: 'Opret en baker',
                body: 'En baker er en node som deltager i netværket ved at bake (lave) nye blocks som bliver tilføjet til kæden. Hver baker har nogle kryptografiske nøgler, som refereres til som "baker keys", som noden bruger når den baker blocks. Du genererer baker keys når du tilføjer en baker-konto. Når baker noden er blevet genstartet med disse baker keys, så vil den starte med at bake, to epochs efter transaktionen er blevet godkendt.',
            },
            '2': {
                title: 'Noden',
                body: 'For at blive en baker skal du køre en node på Concordium blockchain. Det er vigtigt at have det sat op så noden kan køre døgnet rundt.\n\nDu kan køre noden selv eller bruge en tredjepartsudbyder. Sørg for at din konto i din wallet har den nødvendige mængde CCD for at blive en baker.',
            },
            '3': {
                title: 'baker-pulje',
                body: 'Når du opretter en baker kan du vælge at åbne en baker-pulje. En baker-pulje gør det muligt for andre at får fortjenester uden at køre en node eller selv blive baker.\n\n For at gøre dette, så delegerer de CCD til din baker-pulje, som øger din totale stake og din change for at vinde lotteriet om at bake en block. Ved hver pay day bliver fortjenesterne fordelt mellem dig og dine delegators.\n\nDu kan også vælge ikke at åbne en pulje, og så vil det kun være din egen stake som tæller med til lotteriet. Du kan altid åbne eller lukke en pulje senere.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop baking',
                body: 'Hvis du ønsker ikke at bake på en konto, kan du stoppe baking. Der er en cool-down periode, hvor din baker stake stadig vil blive brugt til baking og få fortjenester. Efter denne cool-down periode, bliver din baker stake låst op på din offentlige saldo, og kan bruges igen.\n\nHvis du pulje har delegators, vil de automatisk blive flyttet til passiv delegation.\n\nHvis du afmelder din konto som baker, så husk at dette ikke lukker din node ned. Du skal stadig lukke din node ned separat, hvis du ikke længere ønske at køre en node Concordium blockchain.',
            },
        },
        updateIntro: {
            '2': {
                title: 'Opdater baker stake',
                body: 'Når du opdaterer din baker stake, kan du vælge at øge eller formindske din stake, så vil ændringen som regel tage effekt fra den næste pay day. Hvis det er for tæt på den næste pay day, så vil ændringen tage i kraft den efterfølgende pay day.\n\n Hvis du formindsker din stake så er der en cool-down periode. I denne periode vil din stake stadig blive brugt til baking og få fortjenester\n\nDu kan også ændre hvorvidt dine fortjenester til tilføjet til din stake eller ej.',
            },
            '3': {
                title: 'Opdater puljeindstillinger',
                body: 'Du kan ændre de følgende indstillinger i forbindelse med baker-puljen. Hver af de individuelle indstillinger er frivillige, så du behøver ikke ændre dem alle.\n\nPuljestatus:\n  • Åben pulje: åben en pulje for en tidligere lukket baker\n  • Lukket for nye: luk en pulje for nye delegators. Nuværende delegators vil ikke blive påvirket.\n  • Luk pulje: luk en pulje for alle delegators.\n\nMetadata URL:\n  • metadata URLen kan ændres, fjernes eller forblive den samme.',
            },
            '4': {
                title: 'Opdater puljeindstillinger',
                body: 'Der er en cool-down periode hvis du vælger at lukke en pulje. I løbet af denne periode vil alle delegators blive i puljen, og får fortjenester hvis bakeren baker blocks.\n\nEfter cool-down perioden bliver alle delegators fjernet og puljen lukkes. Bagefter vil bakeren blive ved med at bake med kontoens egen stake.\n\nÆndringerne til metadata URLen tager kraft ved næste pay day medmindre det er for tæt på den næste pay day og i så fald vil ændringen tage i kraft den efterfølgende pay day.',
            },
            '5': {
                title: 'Opdater baker keys',
                body: 'Hvis du har tabt dine baker keys eller de er blevet kompromitteret, så kan du generere og registrere et nyt sæt baker keys. Det er vigtigt at genstarte din node med de nye nøgler efter de er blevet registreret på kæden. Da ændringen tager kraft ved næste pay day, er det bedst at genstarte noden med de nye nøgler så tæt på den næste pay day som muligt, for at minimere tiden hvor din baker ikke baker.',
            },
        },
        register: {
            title: 'Opret en baker',
        },
        update: {
            title: {
                stake: 'Opdater baker stake',
                pool: ' Opdater puljeindstillinger',
                keys: 'Opdater baker keys',
            },
            noChanges: 'Transaktionen indeholder ikke nogen ændringer i forhold til de nuværende puljeindstillinger.',
        },
        details: {
            heading: 'Din baker er registreret.',
            amount: 'Baker stake',
            restake: 'Fortjenester vil blive',
            update: 'Opdater',
            stop: 'Stop',
            pending: 'Der ventes på at transaktionen bliver finalized',
            failed: 'Transaktionen fejlede',
        },
        configure: {
            restake: {
                description:
                    'Vil du gerne automatisk tilføje dine fortjenester som din baker stake?\n\nHvis du vælger ikke at indsætte dine fortjenester, vil de blive tilføjet til din offentlige saldo hver pay day.',
                optionRestake: 'Ja, indsæt',
                optionNoRestake: 'Nej, indsæt ikke',
            },
            amount: {
                description: 'Indtast din ønskede delegation saldo',
                amountLabel: 'Delegation saldo',
                amountRequired: 'Du skal specificere en delegation saldo',
                locked: 'Saldo låst',
                lockedNote: 'Du kan ikke ændre saldoen mens der er en kommende ændring',
                overStakeThresholdWarning:
                    'Du er ved at låse mere end {{ threshold }}% af din totale saldo som din baker stake.\n\nHvis du ikke har nok ulåste CCD, vil du ikke kunne betale for transaktionsomkostninger.',
                enterNewStake: 'Indtast ny baker stake',
            },
            openForDelegation: {
                description:
                    'Du kan åbne en pulje for din baker, så andre kan delegere CCD til dig\n\nHvis du åbner en pulje, så vil andre kunne delegere CCD til din baker-pulje\n\nDu kan også vælge ikke at åbne en pulje, hvis du kun ønsker at dine egne CCD bliver brugt til din baker',
            },
            commission: {
                description:
                    'Når du åbner en baker-pulje, vil du tjene provision fra CCD som bliver delegated til din pulje fra andre konti:',
            },
            keys: {
                save: 'Eksporter baker keys',
                description:
                    'Dine nye baker keys er blevet genereret. For at kunne fortsætte skal du eksportere og gemme dem. Nøglerne skal derefter tilføjes til baker noden.\n\nBEMÆRK: Udover at eksportere nøglerne sal du færdiggøre og indsende denne transaktion for at din konto bliver registreret som en baker.',
                downloadedTitle: 'Bemærk',
                downloaded:
                    'Dine nøgler er blevet downloaded som "{{ fileName}}", du kan nu fortsætte og færdiggøre transaktionen',
            },
            metadataUrl: {
                description:
                    'Du kan tilføje en URL med metadata om din baker. Du kan efterlade den blank, hvis du ikke vil tilføje noget.',
                label: 'Indtast metadata URL',
                maxLength: 'MetadataUrl længde må ikke være mere end {{ maxLength }}',
            },
            warning: 'Advarsel',
            continueButton: 'Fortsæt',
        },
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    accountRejected: 'Denne konto kunne ikke blive oprettet.',
    request: 'Opret konto',
    unknown: 'Ukendt',
};

export default t;
