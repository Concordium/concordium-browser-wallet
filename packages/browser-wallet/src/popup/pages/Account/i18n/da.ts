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
        stakeWithBaker: 'Stake ved validator {{ bakerId }}',
        delegationWithBaker: 'Delegation ved staking pool {{ bakerId }}',
        passiveDelegation: 'Passiv delegation',
    },
    settings: {
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
        submitted: 'Transaktionen er blevet indsendt!',
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
            indexRequired: 'Kontraktindeks er påkrævet',
            negativeIndex: 'Kontraktindeks kan ikke være et negativt tal',
            indexMax: 'Kontraktindeks må højst være 18446744073709551615',
            invalidIndex: 'Kontraktindeks skal være et heltal',
            noContractFound: 'Ingen kontrakt fundet på indeks',
            noTokensError: 'Ingen tokens fundet i kontrakten',
            failedTokensError: 'En fejl skete under tjekket efter tokens',
            contractIndex: 'Kontraktindeks',
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
        description: 'Der are to måder at få fortjenester på Concordium: Validation and delegation.',
        bakingHeader: 'Validation',
        bakingDescription:
            'Som en validator deltager i netværket ved at bage blocks på Concordium netværket. Dette kræver som minimum {{ minAmount }} CCD og adgang til en dedikeret node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            'Hvis du ikke har adgang til din egen node kan du delegere dit stake til en anden validator. Det kræver ikke noget minimumsbeløb af CCD for at delegere\n\nVælg muligheden der passer dig bedst nedenfor for at lære mere.\n\nNOTE: Én konto kan ikke både være validator og delegator, men det er muligt at skifte ved at stoppe den nuværende rolle.',
        delegateCta: 'Opsæt delegation',
        bakingCta: 'Opsæt validation',
    },
    delegate: {
        registerIntro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation tillader brugere af Concordium blockchain at få fortjenester uden at være validator eller køre en node.\n\nVed at indsætte CCD på din delegation saldo kan du få fortjenester.\n\nPå de næste sider, vil vi gå igennem de basale delegation koncepter. Hvis du vil lære mere, kan du besøge vores <1>dokumentation side</1>.',
            },
            '2': {
                title: 'Delegation modeller',
                body: 'Der er to modeller man kan være til delegation. <2><3>Delegating til en specifik pulje</3><3>Passiv delegation</3></2>En validator-pulje administreres af en individuel validator, som kører en node, så fortjenesterne afhænger af validatorens ydeevne/stabilitet.\n\nPassiv delegation går ikke til en specifik pulje, hvilket gør at det mitigerer risikoen for problemer med en validator, men fortjenesterne er lavere.\n\nFor at læse mere, besøg vores <1>dokumentation side</1>.',
            },
            '3': {
                title: 'validator-puljer',
                body: 'En validator-pulje administreres af en individuel validator.\n\nAt have en pulje kan give validatoren en større stake og øge deres chance for at blive valgt til at bake en block.\n\nValidatorer tjener provision fra deres delegators når de validator en block.\n\nDelegering til en pulge har normalt højere fortjeneste end passiv delegation, men der er en risiko for at tabe fortjenester hvis validatoren ikke er stabil eller oplever problemer. Det er derfor en god ide at holde øje med validatorens velbefindende.\n\nDu kan læse mere om dette på vores <1>dokumentation side</1>.',
            },
            '4': {
                title: 'Passiv delegation',
                body: 'For CCD indehavere som ikke ønske at holde øje med deres valgte puljes velbefindende, men bare vil have stabile fortjenester, så er passiv delegation et lav-risiko, lav-fortjeneste alternative.\n\nDenne strategi er ikke forbundet med en specfic validator, så der er ingen risiko ved en validator dårlige velbefindende.\n\nPassiv delegation tilbyder dog lavere fortjenester end hvad du ville kunne forvente hvis du valgt en bestemt pulje.',
            },
            '5': {
                title: 'Pay days',
                body: 'Uanset om du har valgt en bestemt validator-pulje eller passiv delegation, så bliver fortjenester betalt ud ved en pay day. Fortjenesterne er distribureret ud til alle i puljen forholdsmæssigt til deres delegation saldo, og en provision er udbetalt til validators af alle delegators.\n\nHvis du senere ændrer dine delegationindstillinger, så vil de fleste af dem træde i kraft ved den efterfølgende pay day.\n\nFor at læse mere om en pay day, kan du besøge vores <1>dokumentation side</1>.',
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
                body: 'Hvis du vælger at formindske din delegation saldo, så vil ændringen træde i kraft efter en cool-down periode.\n\nI løbet af denne cool-down periode, vil delegation saldoen være låst og kan ikke ændres, og du vil ikke kunne stoppe delegation.\n\nDu vil stadig få fortjenester i cool-down perioden, og du vil stadig kunne ændre andre delegationindstillinger.\n\nHvis du laver andre ændringer samtidigt med at du formindsker delegation saldoen, vil disse ændringer træde i kraft ved den næste pay day, som beskrevet på sidste side.',
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
            targetBaker: 'Validator {{bakerId}}',
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
        remove: {
            notice: 'At stoppe en validator træder i kraft efter en cool-down periode på {{cooldownPeriod}} dage. I løbet af denne periode er validator stake låst og kan ikke ændres.',
        },
        configure: {
            pool: {
                description1:
                    'Du kan delegere til en vilkårlig åben validator-pulje, eller du kan delegere med Passiv delegation',
                optionBaker: 'Validator',
                optionPassive: 'Passiv',
                descriptionBaker:
                    'Hvis du ikke allerede ved hvilke validator-pulje du vil delegere til, kan du læse mere på vores <1>dokumentation side</1>',
                descriptionPassive:
                    'Passiv delegation er et alternativ til delegation til en specifik bager pulje, men har lavere fortjenester. Med passiv delegation behøver du ikke bekymre om dig om oppetiden eller kvaliteten af validator noden.\n\nFor mere info, kan du besøge vores <1>dokumentation side</1>',
                bakerIdLabel: 'Validator ID',
                bakerIdRequired: 'Du skal specificere et validator ID',
                targetNotOpenForAll: 'Valgt validator tillader ikke nye delegators',
                currentStakeExceedsCap: 'Din nuværende delegation saldo overtræder den valgte validators loft',
                chosenStakeExceedsCap: 'Den valgte delegation saldo  overtræder validatorens loft',
                notABaker: 'Det medgivne validator ID svarer ikke til en aktiv validator',
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
                decreaseWarning:
                    'At formindske din delegation saldo låser hele delegation saldoen i en cool-down periode. Det er ikke muligt at ændre mængden i denne periode og flytningen af CCD træder ikke i kraft indtil cool-down perioden er afsluttet.',
                enterNewStake: 'Indtast ny delegation saldo',
            },
        },
    },
    baking: {
        registerIntro: {
            '1': {
                title: 'Opret en validator',
                body: 'En validator er en node som deltager i netværket ved at producere nye blocks som bliver tilføjet til kæden.\n\nHver validator har nogle kryptografiske nøgler, som refereres til som "validator keys", som noden bruger når den validator blocks.\n\nDu genererer validator keys når du tilføjer en validator-konto. Når validator noden er blevet genstartet med disse validator keys, så vil den starte validation to epochs efter transaktionen er blevet godkendt.',
            },
            '2': {
                title: 'Noden',
                body: 'For at blive en validator skal du køre en node på Concordium blockchain. Det er vigtigt at have det sat op så noden kan køre døgnet rundt.\n\nDu kan køre noden selv eller bruge en tredjepartsudbyder. Sørg for at din konto i din wallet har den nødvendige mængde CCD for at blive en validator.',
            },
            '3': {
                title: 'validator-pulje',
                body: 'Når du opretter en validator kan du vælge at åbne en validator-pulje. En validator-pulje gør det muligt for andre at får fortjenester uden at køre en node eller selv blive validator.\n\n For at gøre dette, så delegerer de CCD til din validator-pulje, som øger din totale stake og din change for at vinde lotteriet om at bake en block. Ved hver pay day bliver fortjenesterne fordelt mellem dig og dine delegators.\n\nDu kan også vælge ikke at åbne en pulje, og så vil det kun være din egen stake som tæller med til lotteriet. Du kan altid åbne eller lukke en pulje senere.',
            },
        },
        removeIntro: {
            '1': {
                title: 'Stop validation',
                body: 'Hvis du ønsker ikke at bake på en konto, kan du stoppe validation. Der er en cool-down periode, hvor din validator stake stadig vil blive brugt til validation og få fortjenester. Efter denne cool-down periode, bliver din validator stake låst op på din offentlige saldo, og kan bruges igen.\n\nHvis du pulje har delegators, vil de automatisk blive flyttet til passiv delegation.\n\nHvis du afmelder din konto som validator, så husk at dette ikke lukker din node ned. Du skal stadig lukke din node ned separat, hvis du ikke længere ønske at køre en node Concordium blockchain.',
            },
        },
        updateIntro: {
            '2': {
                title: 'Opdater validator stake',
                body: 'Når du opdaterer din validator stake, kan du vælge at øge eller formindske din stake, så vil ændringen som regel tage effekt fra den næste pay day. Hvis det er for tæt på den næste pay day, så vil ændringen tage i kraft den efterfølgende pay day.\n\n Hvis du formindsker din stake så er der en cool-down periode. I denne periode vil din stake stadig blive brugt til validation og få fortjenester\n\nDu kan også ændre hvorvidt dine fortjenester til tilføjet til din stake eller ej.',
            },
            '3': {
                title: 'Opdater puljeindstillinger',
                body: 'Du kan ændre de følgende indstillinger i forbindelse med validator-puljen. Hver af de individuelle indstillinger er frivillige, så du behøver ikke ændre dem alle.\n\nPuljestatus:\n  • Åben pulje: åben en pulje for en tidligere lukket validator\n  • Lukket for nye: luk en pulje for nye delegators. Nuværende delegators vil ikke blive påvirket.\n  • Luk pulje: luk en pulje for alle delegators.\n\nMetadata URL:\n  • metadata URLen kan ændres, fjernes eller forblive den samme.',
            },
            '4': {
                title: 'Opdater puljeindstillinger',
                body: 'Der er en cool-down periode hvis du vælger at lukke en pulje. I løbet af denne periode vil alle delegators blive i puljen, og får fortjenester hvis validatoren validator blocks.\n\nEfter cool-down perioden bliver alle delegators fjernet og puljen lukkes. Bagefter vil validatoren blive ved med at bake med kontoens egen stake.\n\nÆndringerne til metadata URLen tager kraft ved næste pay day medmindre det er for tæt på den næste pay day og i så fald vil ændringen tage i kraft den efterfølgende pay day.',
            },
            '5': {
                title: 'Opdater validator keys',
                body: 'Hvis du har tabt dine validator keys eller de er blevet kompromitteret, så kan du generere og registrere et nyt sæt validator keys. Det er vigtigt at genstarte din node med de nye nøgler efter de er blevet registreret på kæden. Da ændringen tager kraft ved næste pay day, er det bedst at genstarte noden med de nye nøgler så tæt på den næste pay day som muligt, for at minimere tiden hvor din validator ikke validator.',
            },
        },
        register: {
            title: 'Registrer validator',
        },
        update: {
            title: {
                stake: 'Opdater validator stake',
                pool: ' Opdater puljeindstillinger',
                keys: 'Opdater validator keys',
            },
            noChanges: 'Transaktionen indeholder ikke nogen ændringer i forhold til de nuværende puljeindstillinger.',
        },
        remove: {
            notice: 'At stoppe delegation træder i kraft efter en cool-down periode på {{cooldownPeriod}} dage. I løbet af denne periode er validator stake låst og kan ikke ændres.',
        },
        details: {
            heading: 'Din validator er registreret.',
            amount: 'Validator stake',
            restake: 'Fortjenester vil blive',
            update: 'Opdater',
            stop: 'Stop',
            pending: 'Der ventes på at transaktionen bliver finalized',
            failed: 'Transaktionen fejlede',
        },
        configure: {
            restake: {
                description:
                    'Vil du gerne automatisk tilføje dine fortjenester som din validator stake?\n\nHvis du vælger ikke at indsætte dine fortjenester, vil de blive tilføjet til din offentlige saldo hver pay day.',
                optionRestake: 'Ja, indsæt',
                optionNoRestake: 'Nej, indsæt ikke',
            },
            amount: {
                description: 'Indtast din ønskede validator stake',
                amountLabel: 'Validator stake',
                amountRequired: 'Du skal specificere en validator stake',
                locked: 'Validator stake låst',
                lockedNote: 'Du kan ikke ændre saldoen mens der er en kommende ændring',
                overStakeThresholdWarning:
                    'Du er ved at låse mere end {{ threshold }}% af din totale saldo som din validator stake.\n\nHvis du ikke har nok ulåste CCD, vil du ikke kunne betale for transaktionsomkostninger.',
                decreaseWarning:
                    'At formindske din validator stake låser hele din validator stake i en cool-down periode. Det er ikke muligt at ændre mængden i denne periode og flytningen af CCD træder ikke i kraft indtil cool-down perioden er afsluttet.',
                enterNewStake: 'Indtast ny validator stake',
            },
            openForDelegation: {
                description:
                    'Du kan åbne en pulje for din validator, så andre kan delegere CCD til dig\n\nHvis du åbner en pulje, så vil andre kunne delegere CCD til din validator-pulje\n\nDu kan også vælge ikke at åbne en pulje, hvis du kun ønsker at dine egne CCD bliver brugt til din validator',
            },
            commission: {
                description:
                    'Når du åbner en validator-pulje, vil du tjene provision fra CCD som bliver delegated til din pulje fra andre konti:',
            },
            keys: {
                save: 'Eksporter validator keys',
                description:
                    'Dine nye validator keys er blevet genereret. For at kunne fortsætte skal du eksportere og gemme dem. Nøglerne skal derefter tilføjes til validator noden.\n\nBEMÆRK: Udover at eksportere nøglerne sal du færdiggøre og indsende denne transaktion for at din konto bliver registreret som en validator.',
                downloadedTitle: 'Bemærk',
                downloaded:
                    'Dine nøgler er blevet downloaded som "{{ fileName}}", du kan nu fortsætte og færdiggøre transaktionen',
            },
            metadataUrl: {
                description:
                    'Du kan tilføje en URL med metadata om din validator. Du kan efterlade den blank, hvis du ikke vil tilføje noget.',
                label: 'Indtast metadata URL',
                maxLength: 'MetadataUrl længde må ikke være mere end {{ maxLength }}',
            },
            warning: 'Advarsel',
        },
    },
    transactionMessage: {
        configureBaker: {
            registerBaker:
                'Du er ved at indsende en transaktion som registrerer dig som en validator, hvillket som låser nogle af dine CCD som validator stake. Hvis du vil frigøre din stake, vil der være en cool-down periode.',
            lowerBakerStake:
                'Du er ved at indsende en transaktion som formindsker din validator stake. At formindske din validator stake har en cool-down periode, hvilket betyder at ændringen ikke træder i kraft med det samme.\n\nValidatoren kan ikke fjernes og din validator stake kan ikke ændres indtil cool-down perioden er overstået.',
            removeBaker: 'Er du sikker du vil lave denne transaktion som stopper validation?',
        },
        configureDelegation: {
            register:
                'Du er ved at indsende en transaktion som registrerer dig som en delegator, hvillket som låser nogle af dine CCD som delegation stake. Hvis du vil frigøre din stake, vil der være en cool-down periode på {{ cooldownPeriod }} dage.',
            lowerDelegationStake:
                'Du er ved at indsende en transaktion som formindsker din delegation stake. Det vil træde i kraft efter {{ cooldownPeriod }} dage og din delegation saldo kan ikke ændres i denne periode.',
            remove: 'Er du sikker du vil fjerne din delegation?',
        },
    },
    transactionPopup: {
        configureBaker: {
            start: 'Når din transaktion er finalized, vil validator registreringen starte fra den efterfølgende pay day.\n\nHusk at genstarte din node med de nye validator keys',
            update: 'Når din transaktion er blevet finalized, vil validator opdateringen træde i kraft fra den efterfølgende pay day.',
            updateKeys:
                'Når din transaktion er finalized, vil de nye validator keys blive gyldige fra den efterfølgende pay day.\n\nDu bør derfor genstarte din node med de nye validator keys så tæt på den næste pay day som muligt.',
        },
        configureDelegation: {
            start: 'Når din transaktion er blevet finalized, vil delegation starte fra den efterfølgende pay day.',
            update: 'Når din transaktion er blevet finalized, vil delegation opdateringen træde i kraft fra den efterfølgende pay day.',
        },
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    accountRejected: 'Denne konto kunne ikke blive oprettet.',
    request: 'Opret konto',
    unknown: 'Ukendt',
    warning: 'Advarsel',
    important: 'Vigtigt',
};

export default t;
