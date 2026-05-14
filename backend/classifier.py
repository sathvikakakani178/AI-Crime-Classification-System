import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODEL_PATH = "crime_model.joblib"

# ── Category Definitions ───────────────────────────────────────────────────────

CATEGORIES = {
    "CYBER_CRIME":    "Cyber Crime",
    "FRAUD":          "Fraud & Financial Crime",
    "THEFT":          "Theft & Robbery",
    "VIOLENCE":       "Violence & Physical Assault",
    "HARASSMENT":     "Harassment & Stalking",
    "DRUG_OFFENSE":   "Drug Offense",
    "PROPERTY_CRIME": "Property Crime",
    "OTHER":          "Other / Unclassified",
}

# ── Severity Rules ─────────────────────────────────────────────────────────────

SEVERITY_CONFIG = {
    "CYBER_CRIME":    {"base": 6, "label": "HIGH"},
    "FRAUD":          {"base": 7, "label": "HIGH"},
    "THEFT":          {"base": 5, "label": "MEDIUM"},
    "VIOLENCE":       {"base": 9, "label": "CRITICAL"},
    "HARASSMENT":     {"base": 5, "label": "MEDIUM"},
    "DRUG_OFFENSE":   {"base": 6, "label": "HIGH"},
    "PROPERTY_CRIME": {"base": 4, "label": "MEDIUM"},
    "OTHER":          {"base": 2, "label": "LOW"},
}

SEVERITY_LABELS = {1: "LOW", 2: "LOW", 3: "LOW", 4: "MEDIUM",
                   5: "MEDIUM", 6: "HIGH", 7: "HIGH", 8: "HIGH",
                   9: "CRITICAL", 10: "CRITICAL"}

# ── Explanations ───────────────────────────────────────────────────────────────

EXPLANATIONS = {
    "CYBER_CRIME": (
        "The narrative contains indicators of cybercrime activity such as unauthorized system access, "
        "digital fraud, malware deployment, phishing attempts, or data breaches. These are offenses "
        "conducted through digital or electronic means targeting individuals, organizations, or infrastructure."
    ),
    "FRAUD": (
        "The narrative describes deceptive practices intended to gain financial benefit or cause financial "
        "loss to the victim. This includes scams, impersonation, false promises, Ponzi schemes, or misuse "
        "of financial instruments such as credit cards or bank accounts."
    ),
    "THEFT": (
        "The narrative involves the unlawful taking of property or assets belonging to another person "
        "without their consent. This encompasses robbery, burglary, shoplifting, pickpocketing, carjacking, "
        "or any act of stealing physical goods."
    ),
    "VIOLENCE": (
        "The narrative describes physical harm, force, or threat of force against a person. This includes "
        "assault, battery, domestic violence, homicide, or use of weapons. These are serious offenses with "
        "potential for significant physical and psychological harm."
    ),
    "HARASSMENT": (
        "The narrative indicates repeated, unwanted behavior targeting an individual causing distress. "
        "This includes stalking, cyberbullying, workplace harassment, threatening communications, "
        "or sustained emotional/psychological abuse."
    ),
    "DRUG_OFFENSE": (
        "The narrative involves the illegal possession, manufacture, sale, or distribution of controlled "
        "substances. This includes trafficking, possession with intent to supply, or operating under the "
        "influence of prohibited drugs."
    ),
    "PROPERTY_CRIME": (
        "The narrative describes damage to, destruction of, or trespassing on property belonging to another. "
        "This includes vandalism, arson, criminal mischief, illegal entry, or unauthorized use of premises."
    ),
    "OTHER": (
        "The narrative does not clearly match a specific crime category based on the available information. "
        "It may involve a non-criminal dispute, a minor offense, or require more details for accurate classification."
    ),
}

# ── Legal Next Steps ───────────────────────────────────────────────────────────

LEGAL_STEPS = {
    "CYBER_CRIME": [
        "File a complaint at cybercrime.gov.in (India's National Cyber Crime Reporting Portal).",
        "Preserve all digital evidence — screenshots, email headers, transaction IDs, chat logs.",
        "Report to your bank immediately if financial accounts are compromised.",
        "File an FIR at your nearest police station under IT Act 2000 / 2008 (Sections 66, 66C, 66D, 67).",
        "Contact CERT-In (Indian Computer Emergency Response Team) for cyber incidents affecting organizations.",
        "Engage a cybersecurity professional to assess and contain the breach.",
    ],
    "FRAUD": [
        "File an FIR at your local police station citing IPC Sections 420 (Cheating), 406, 468, 471.",
        "Report to the National Consumer Helpline: 1800-11-4000 or file at consumerhelpline.gov.in.",
        "Alert your bank and request a transaction freeze or reversal where possible.",
        "Report investment fraud to SEBI at scores.sebi.gov.in.",
        "File a complaint with the RBI Ombudsman if a bank or NBFC is involved.",
        "Keep all communication records, contracts, receipts, and transaction proofs.",
    ],
    "THEFT": [
        "File an FIR immediately at the nearest police station under IPC Section 379 (Theft) or 392 (Robbery).",
        "Obtain the FIR copy — required for insurance claims and further legal proceedings.",
        "If a vehicle was stolen, inform the RTO and your insurance provider within 24 hours.",
        "Report loss of identity documents to the issuing authority (Passport, Aadhaar, DL).",
        "Check local CCTV footage — request police to preserve it as evidence.",
        "Contact your bank to block stolen cards or cheque books.",
    ],
    "VIOLENCE": [
        "Seek immediate medical attention and ensure your safety first.",
        "Call 100 (Police) or 112 (Emergency) if the threat is ongoing.",
        "File an FIR under IPC Sections 323, 324, 325, 354 (assault), or 302/304 (homicide).",
        "In cases of domestic violence, approach a Protection Officer or file under the PWDVA 2005.",
        "Obtain a medico-legal certificate (MLC) from a government hospital.",
        "Apply for a protection order from the Magistrate's Court if at ongoing risk.",
    ],
    "HARASSMENT": [
        "File an FIR under IPC Section 354D (Stalking), 503 (Criminal Intimidation), or 507.",
        "For cyber harassment, file at cybercrime.gov.in under IT Act Section 66E or 67.",
        "For workplace harassment, file a complaint with the Internal Complaints Committee (ICC) under POSH Act.",
        "Preserve all evidence — messages, call logs, emails, social media posts.",
        "Apply for a restraining order or protection order from the local Magistrate.",
        "Contact the National Commission for Women (NCW) helpline: 7827170170.",
    ],
    "DRUG_OFFENSE": [
        "Report to the nearest police station or Narcotics Control Bureau (NCB) office.",
        "For addiction support, contact the National Drug Helpline: 1800-11-0031.",
        "Offenses are governed by the NDPS Act 1985 — penalties vary by substance and quantity.",
        "Do not attempt to handle or dispose of suspected drug evidence yourself.",
        "Cooperate fully with law enforcement — unauthorized possession is a cognizable offense.",
        "Legal aid is available for accused persons through the District Legal Services Authority (DLSA).",
    ],
    "PROPERTY_CRIME": [
        "File an FIR under IPC Section 425 (Mischief), 426, 427, 441 (Criminal Trespass), or 435 (Arson).",
        "Document all damage with photographs and videos before any cleanup.",
        "Notify your property insurance provider and file a claim with supporting evidence.",
        "Obtain a property valuation report for damaged items if seeking compensation.",
        "Request police to check CCTV and collect forensic evidence at the scene.",
        "If rented property is damaged, notify the landlord and relevant housing authority.",
    ],
    "OTHER": [
        "Visit your nearest police station to report the incident and seek guidance.",
        "Consult a legal aid lawyer — free services available at District Legal Services Authority (DLSA).",
        "Document the incident in writing with dates, times, witnesses, and any evidence.",
        "Call the National Legal Services Authority (NALSA) helpline: 15100 for free legal advice.",
        "Check if the matter falls under civil law and may require approaching a civil court.",
    ],
}

# ── Synthetic Training Data ────────────────────────────────────────────────────

def generate_training_data():
    data = []

    cyber_samples = [
        "Someone hacked my email account and sent phishing messages to all my contacts.",
        "I received a ransomware attack that encrypted all files and demanded bitcoin payment.",
        "My online banking credentials were stolen through a fake website.",
        "Hackers breached our company database and leaked customer information.",
        "A malware infected my computer and my personal data was compromised.",
        "I got a phishing email pretending to be from my bank asking for my password.",
        "Someone created a fake social media profile using my photos and identity.",
        "My credit card details were skimmed at an ATM and used for unauthorized transactions.",
        "Our server was hit by a DDoS attack and went offline for 12 hours.",
        "Someone accessed my cloud storage without permission and deleted my files.",
        "A trojan was installed on my device and my webcam was accessed remotely.",
        "I received threatening emails from an anonymous account demanding money or they'd publish private photos.",
        "My company's internal systems were breached and source code was stolen.",
        "Someone used my identity to open bank accounts and apply for loans online.",
        "I was targeted by a SIM swap attack and lost access to all my accounts.",
        "Hackers installed spyware on my phone through a fake app on the app store.",
        "My social media was compromised and used to post inappropriate content.",
        "I received an email with malicious attachment that corrupted my hard drive.",
        "Someone broke into our office systems using brute force and accessed payroll data.",
        "A cybercriminal used my photos and name to create fake dating profiles.",
        # Brand specific tech support remote access scam patterns
        "Someone called saying he is from Apple support said my iCloud was hacked made me install AnyDesk and transferred money from my bank.",
        "A person called claiming to be from Apple support made me install AnyDesk and remotely accessed my bank account.",
        "Fake Apple customer care called about iCloud hack made me download remote software and stole money from account.",
        "Someone posing as Apple support agent made me install remote access app and drained my bank account.",
        "A caller from fake Google support said my account was compromised made me install AnyDesk and stole my money.",
        "Person claiming to be from Amazon support made me install remote desktop software and accessed my banking.",
        "Fake iPhone support called about virus on my device made me install software and transferred money remotely.",
        "Someone called from fake Apple helpline about iCloud security breach and remotely stole money via AnyDesk.",
        "A person posing as tech support from a well known company made me install AnyDesk and emptied my bank account.",
        "Caller said my device was hacked and made me install remote access software to fix it then stole my savings.",
        # Tech support remote access scam patterns
        "A person called from Microsoft support made me install remote access software and then stole money from my bank.",
        "Someone called claiming to be from tech support made me install an app and remotely accessed my bank account.",
        "A fake Microsoft technician made me download remote access software and transferred money from my account.",
        "Someone called saying my computer has a virus and made me install software that gave them access to my banking.",
        "A tech support scammer made me install TeamViewer and then accessed my net banking and transferred money.",
        "Fake customer support called and made me install an app then took control of my device and stole money.",
        "A person posing as computer technician remotely accessed my device through an app and drained my bank account.",
        "Someone called about a virus on my computer made me install software and then accessed my bank account remotely.",
        # Hacking + blackmail + data deletion patterns
        "Someone hacked into my system and deleted all my data to blackmail me into paying them money.",
        "A person hacked my business software and deleted records to force me to comply with their demands.",
        "My computer systems were hacked and data was deleted as blackmail to make me accept an illegal offer.",
        "Someone broke into my hospital management system and erased patient records to blackmail and coerce me.",
        "A hacker deleted my company data and is blackmailing me threatening to cause more damage unless I pay.",
        "My database was hacked and records deleted by someone trying to force me into an illegal arrangement.",
        "Someone gained unauthorized access to my systems, destroyed data, and is using it as blackmail leverage.",
        "A cybercriminal hacked my professional systems and deleted critical records to coerce me into compliance.",
        "My work systems were compromised and data erased as a threat to make me agree to a bribe offer.",
        "Someone hacked into my professional software and wiped records to blackmail me after I refused a bribe.",
        # Hacked surveillance / remote access / stalking via cyber
        "Someone hacked into my home CCTV cameras and is watching me remotely and sending screenshots to threaten me.",
        "My ex hacked my security cameras and is monitoring my house remotely and using footage to stalk and threaten me.",
        "A person gained unauthorized access to my CCTV system and is spying on me and sending recordings to intimidate me.",
        "Someone remotely hacked my home cameras and is watching my daily activities and threatening me with the footage.",
        "My security cameras were hacked and someone is accessing the live feed remotely and sending me screenshots.",
        "An unknown person broke into my CCTV network and is monitoring my home and using surveillance footage to threaten me.",
        "My home surveillance system was compromised and the hacker is watching me and sending threatening screenshots.",
        "Someone illegally accessed my IP cameras and is using the footage to stalk and intimidate me remotely.",
        # Email phishing / fake subscription / credit card theft
        "I received an email saying my Netflix account will be cancelled. I clicked the link and entered my credit card on a fake page and got fraudulent charges.",
        "A fake Netflix email tricked me into entering my credit card details on a phishing page and money was deducted.",
        "I got an email about account cancellation, clicked the link, entered payment details on a fake website and was charged.",
        "A phishing email pretending to be from a streaming service made me enter my card details on a fake login page.",
        "I received a fake subscription renewal email and entered my credit card on a cloned website. Unknown charges appeared.",
        "A fraudulent email claiming my account was suspended made me click a link and enter card details on a fake site.",
        "Someone sent a fake email pretending to be Amazon and I entered my payment details on the fake checkout page.",
        "I clicked a link in an email about account expiry and my credit card was charged after I entered details on fake site.",
        # Fake website / phishing / credential theft patterns
        "Someone created a fake website of my bank and stole my login credentials and transferred 1 lakh from my account.",
        "A fake bank website stole my username and password and hackers transferred money from my account.",
        "I clicked on a fake link that looked like my bank website and entered my credentials. Money was transferred.",
        "Cybercriminals made a duplicate of my bank portal website and I entered my login details and lost money.",
        "A phishing website that looked exactly like my bank tricked me into entering my credentials and drained my account.",
        "I visited a fake copy of my bank website and my login was stolen and used to transfer funds.",
        "Someone built a cloned bank website and sent me a link. I logged in and my account was emptied.",
        "A fraudulent website impersonating my bank collected my internet banking credentials and made unauthorized transfers.",
        "I received a link to a fake bank website where I entered my details and the hacker transferred all my money.",
        "Hackers created a duplicate bank website to steal my login and password and transferred money without my knowledge.",
        "Someone made a fake copy of SBI website and I unknowingly logged in and my credentials were stolen.",
        "A cloned HDFC bank website phished my username and password and the attackers drained my savings account.",
        "I was directed to a fake banking portal that harvested my credentials and used them to transfer funds illegally.",
        "Cybercriminals used a spoofed bank website to capture my login details and perform unauthorized transactions.",
        "My net banking was compromised after I logged into a fake website that looked identical to my bank.",
    ]

    fraud_samples = [
        "I paid an advance for a job that does not exist and the person disappeared.",
        "Someone called pretending to be from the IRS demanding immediate payment.",
        "I was scammed by a fake real estate agent who took my deposit and vanished.",
        "An investment advisor ran a Ponzi scheme and I lost my life savings.",
        "I bought goods online but never received them and the seller is uncontactable.",
        "I received a lottery winning notification and paid fees but got nothing.",
        "A loan company charged processing fees and then denied the loan, keeping my money.",
        "I was cheated by a fake charity collecting donations for disaster relief.",
        "Someone forged my signature on documents to transfer my property.",
        "A contractor took advance payment for home renovation and never showed up.",
        "I was defrauded by a fake tech support company that remotely accessed my computer.",
        "An online seller sold me counterfeit branded goods at original prices.",
        "A fraudulent matrimonial site extracted money from me using fake profiles.",
        "Someone used my PAN card details to file false income tax returns.",
        "I was promised a government scheme benefit and paid bribe but nothing happened.",
        "A fake travel agency took payment for a tour package that never existed.",
        "My business partner embezzled company funds over several months.",
        "I received a cheque that bounced after I delivered goods worth lakhs.",
        "Someone impersonated a bank official and stole my account details over the phone.",
        "I was sold fake gold jewelry at full price by a jewelry store.",
        "A person called claiming to be an RBI officer and asked me to transfer money to a safe account. I lost 50000 rupees.",
        "Someone pretending to be from RBI called and said my account will be blocked unless I share my OTP immediately.",
        "A fake RBI official called me and said my KYC is expired and I need to pay to update it. I transferred 30000 rupees.",
        "I received a call from someone claiming to be a bank manager asking me to share OTP to avoid account suspension.",
        "A person said he was from SBI fraud department and convinced me to transfer money to a safe account. It was a scam.",
        "Someone called saying I won a KBC lottery and asked me to pay GST to claim the prize money.",
        "I got a WhatsApp message saying my electricity connection will be cut and to pay immediately on a UPI link.",
        "A fake electricity department officer called and demanded immediate payment via Google Pay or connection will be cut.",
        "Someone impersonated a customs officer and said I need to pay duty to release a parcel with dollars inside.",
        "I received a message that I won an iPhone in a lucky draw and need to pay shipping charges to claim it.",
        "A person called claiming to be CBI officer and said my Aadhaar is linked to illegal transactions.",
        "Someone called saying my PAN card is suspended due to money laundering and I need to pay a fine immediately.",
        "A fake Amazon executive called and said I have unclaimed cashback that I can get after paying a small processing fee.",
        "I received a job offer and paid registration and training fees but the company never existed.",
        "Someone offered me a loan with low interest and took processing fee and insurance fee but never gave the loan.",
        "A person on Instagram offered me high returns on investment and disappeared with my 2 lakh rupees.",
        "I was added to a Telegram group promising daily profits from stock tips and lost all my money following their advice.",
        "A fake police officer called and said my son is in trouble and demanded money to settle the case.",
        "Someone called from a fake bank helpline after I searched for customer care number and stole my account details.",
        "I received an SMS with a link saying my account is suspended and I entered my details on the fake website.",
        # Telegram/crypto investment scam patterns
        "Someone on Telegram added me to a crypto investment group and convinced me to invest 5 lakhs promising huge returns and disappeared.",
        "A person on Telegram convinced me to invest money in cryptocurrency promising daily profits but it was a scam.",
        "I was added to a WhatsApp investment group that promised high returns on crypto and lost all my invested money.",
        "A Telegram group convinced me to invest in fake cryptocurrency scheme and I lost 5 lakhs to these fraudsters.",
        "Someone convinced me through Telegram to invest in crypto for huge profits but it was a fraud and I lost money.",
        "An online investment group on Telegram promised guaranteed returns and took my money without any profit.",
        "I was scammed by a fake cryptocurrency investment scheme promoted on Telegram and lost my entire investment.",
        # OTP phone call fraud patterns (Marathi/Spanish translated equivalents)
        "A person called me saying he is from the bank and asked me to give my OTP. He then transferred all my money.",
        "Someone called claiming to be a bank official and convinced me to share OTP and transferred money from account.",
        "A man called saying my account will be blocked and asked for OTP to verify. Money was transferred immediately after.",
        "I received a call from a person saying he is from SBI and needs my OTP to update KYC. Money got transferred.",
        "A caller pretending to be bank staff asked me to share the OTP received on my phone and drained my account.",
        "Someone called posing as a bank representative and asked me to share a verification code. My money was transferred.",
        "A fraudster called saying my account has suspicious activity and asked for OTP to secure it. Account was emptied.",
        "I was asked to share OTP by someone who said he is from the bank fraud department. I lost all my savings.",
        "A person forced me to transfer money by threatening to block my bank account if I did not comply immediately.",
        "Someone convinced me to transfer money to a safe account to protect it from fraud. It was a scam.",
    ]

    theft_samples = [
        "My car was broken into and my laptop and wallet were stolen from the back seat.",
        "Someone robbed me at knifepoint and took my phone and cash.",
        "My house was burglarized while I was on vacation and jewelry was stolen.",
        "A pickpocket stole my wallet in a crowded market.",
        "My motorcycle was stolen from the parking lot outside my office.",
        "Shop inventory was stolen after someone broke the back window at night.",
        "Someone snatched my gold chain on the street while I was walking.",
        "My bicycle was stolen from outside my building despite being locked.",
        "Thieves broke into my car and stole the stereo system.",
        "Cash was stolen from the office drawer by an employee.",
        "My luggage was stolen at the railway station.",
        "Someone stole my mobile phone from my bag while I was on the bus.",
        "There was a armed robbery at the petrol station I manage.",
        "My farmland equipment was stolen overnight.",
        "Copper wiring was stolen from our factory causing major damage.",
        "Someone stole my credit cards and made purchases before I could block them.",
        "A shoplifter stole expensive merchandise from my store.",
        "My home was looted while the building was under construction.",
        "My car was carjacked at a red light.",
        "Thieves broke into the school premises and stole computers.",
        # Employee / domestic worker theft patterns
        "My domestic worker stole my gold jewelry and ran away when I confronted her about it.",
        "My maid stole cash and jewelry from my house and when I stopped her she created a scene.",
        "Our house help stole valuables from our home and denied it when confronted and tried to leave.",
        "My servant stole money from my cupboard and when I caught her she threatened to file a false complaint.",
        "A domestic worker stole gold ornaments from my house and when confronted tried to escape.",
        "My driver stole cash from my house and when I held him back to question him he threatened to call police.",
        "An employee stole items from my shop and when I stopped them from leaving they became aggressive.",
        "My cook stole jewelry while I was away and when I came back and questioned her she denied everything.",
        "A worker at my house stole valuables and when I confronted them they accused me of assault falsely.",
        "My domestic help stole gold from my locker and when caught claimed I attacked her to distract from the theft.",
    ]

    violence_samples = [
        "I was physically attacked by my neighbor during an argument.",
        "My husband beats me regularly and I need help to file a complaint.",
        "A gang attacked my son with weapons outside his college.",
        "I was assaulted by my employer when I asked for my salary.",
        "Someone shot at our house in an ongoing property dispute.",
        "My brother was stabbed during a street fight last night.",
        "A road rage incident turned violent and I was hit with an iron rod.",
        "I witnessed a murder in my neighborhood and want to report it.",
        "A group of men attacked me outside a bar for no reason.",
        "My employee was beaten up by local goons demanding protection money.",
        "I was attacked with acid by someone I rejected.",
        "My father threatens and hits family members when he is drunk.",
        "A political worker assaulted our entire family over a land dispute.",
        "Women in our village are being physically abused by their husbands.",
        "I was beaten and robbed by men who followed me from the ATM.",
        "My tenant threatened me with a weapon when I asked them to vacate.",
        "Police brutality — I was assaulted in custody without reason.",
        "Two students had a violent fight and one is hospitalized.",
        "An auto driver beat me when I asked for the correct fare.",
        "I was pushed off my bike by a car driver in a road rage incident.",
        # ATM robbery + physical assault patterns
        "Three men followed me from the ATM dragged me into an alley broke my arm and snatched my bag with cash.",
        "I was followed from the bank by attackers who beat me badly broke my bones and stole my money and phone.",
        "Men followed me from ATM cornered me in an alley physically assaulted me and robbed me of all my cash.",
        "I was attacked by a group after withdrawing money they broke my arm and stole everything I had.",
        "Attackers followed me from the ATM beat me severely causing injuries and snatched my bag and belongings.",
        # Loan shark violence patterns
        "A moneylender sent men to my house who beat my family members demanding repayment of a loan with illegal interest.",
        "Private lender goons came to my house assaulted my son and threatened violence until I repay illegal loan.",
        "Loan shark hired men who physically attacked my family at home threatening to return until I paid with interest.",
        "Men sent by a private moneylender beat my family demanding loan repayment and threatened more violence.",
        "A loan shark sent criminals who assaulted my son and broke into my home demanding repayment of money.",
        # Property dispute + physical attack patterns
        "My neighbor hit me with an iron rod during a property dispute and I was hospitalized for treatment.",
        "During a land dispute my neighbor attacked me with a metal rod and I had to go to hospital.",
        "My neighbor beat me with an iron rod over a boundary dispute. I was injured and hospitalized.",
        "A person attacked me with an iron rod during an argument about property. I needed hospital treatment.",
        "My neighbor physically assaulted me with a rod during a property boundary argument. I was hospitalized.",
        "During a dispute over land my neighbor struck me with an iron rod causing serious injuries.",
        "I was attacked and beaten by my neighbor with a metal rod over a property issue. I am in hospital.",
        "My neighbor assaulted me with a weapon during a property fight and I was taken to hospital.",
        "Someone attacked me with an iron rod and I was hospitalized after a dispute with my neighbor.",
        "I was hit with a rod by my neighbor during a fight and required hospital treatment for injuries.",
        # General physical assault with hospitalization
        "I was attacked by someone and had to be hospitalized for my injuries.",
        "A person beat me severely and I was taken to the hospital for treatment.",
        "I was physically assaulted and hospitalized after the attack.",
        "Someone hit me with a rod and I was seriously injured and hospitalized.",
        "I was beaten up by my neighbor and needed medical treatment at the hospital.",
    ]

    harassment_samples = [
        "My ex-boyfriend keeps calling and messaging me even after I blocked him.",
        "A colleague is sending inappropriate messages and making me uncomfortable at work.",
        "Someone is stalking me — following me to my office and home daily.",
        "I am receiving abusive calls from unknown numbers every night.",
        "My neighbor repeatedly plays loud music to disturb us despite complaints.",
        "Someone is sending me morphed photos and threatening to share them online.",
        "A group online is bullying my child on social media every day.",
        "My landlord is harassing me with surprise visits and threats to evict me illegally.",
        "I am being harassed by moneylenders with abusive calls and home visits.",
        "A senior at work is making sexually suggestive remarks and creating a hostile environment.",
        "My estranged husband is threatening to take away the children.",
        "Hate messages and threats are being sent to our community group online.",
        "Someone is spreading false rumors about me to damage my reputation.",
        "My boss withholds my salary as emotional blackmail to force overtime.",
        "I am constantly threatened by local rowdies for refusing to sell my shop.",
        "An anonymous person keeps leaving threatening notes on my car.",
        "My classmate films me without consent and shares it in groups.",
        "Employees from a competing business are harassing our customers outside our store.",
        "I am being threatened by someone who says he has my personal data.",
        "A group of boys follow my daughter to school every day.",
    ]

    drug_samples = [
        "I found drugs hidden in a parcel delivered to my address.",
        "My son is addicted to drugs and I believe his dealer lives nearby.",
        "I noticed suspicious activity and drug exchange happening near my building.",
        "My employee came to work visibly intoxicated and I believe he uses narcotics.",
        "A party at my neighbor's house involved open drug use.",
        "Local students are being sold drugs near the school gate.",
        "I was offered drugs by a stranger at a bus stand.",
        "My family member was caught in possession of illegal substances.",
        "Drug trafficking is happening through a restaurant in our area.",
        "I discovered marijuana plants being grown secretly in a warehouse nearby.",
        "I saw someone selling drugs to students near the school gate every day after school hours.",
        "Two men were exchanging small packets near the school and I believe they are selling drugs to children.",
        "A person is selling narcotics to college students outside the campus gate every evening.",
        "I want to report drug selling activity happening near my children school every day.",
        "Someone is distributing drugs to young students near the school fence during lunch break.",
        "I noticed suspicious drug exchange activity near the school gate targeting young students daily.",
        "Men are selling illegal substances to school children outside the school every afternoon.",
        "Drug dealers are operating near the school and selling to students. I want to report this.",
        "I saw packets being sold to students near the school. I suspect it is drugs being distributed.",
        "A group is selling drugs outside the school premises and targeting young children regularly.",
        # Drug operation in property patterns
        "My tenant has been running a drug operation from my rented house and I want to report it.",
        "I found out my tenant is manufacturing and selling drugs from my property without my knowledge.",
        "Someone is operating an illegal drug business from a rented property in our neighborhood.",
        "My tenant is running a narcotics operation from my house and has damaged the property.",
        "I discovered drugs and drug paraphernalia in my rented property being used by tenants for illegal activity.",
        "A person is using a rented house in our area to store and distribute illegal drugs to buyers.",
        "Illegal drug manufacturing is happening inside a residential property near my house.",
        "My property is being used by tenants to sell and distribute narcotics without my permission.",
    ]

    property_samples = [
        "Vandals spray-painted graffiti all over my shop shutters overnight.",
        "Someone deliberately set fire to my vehicle parked outside my house.",
        "My neighbor broke my compound wall during a boundary dispute.",
        "Construction workers damaged my garden and fence without permission.",
        "Squatters have illegally occupied a portion of my land.",
        "Someone smashed all the windows of my car in a targeted attack.",
        "Protesters damaged public property including buses and traffic signals.",
        "My factory was broken into and machinery was deliberately damaged.",
        "An unknown person destroyed the CCTV cameras outside my shop.",
        "My crops were destroyed by someone poisoning the irrigation water.",
        "Encroachers have built a structure on my registered plot.",
        "Someone deliberately cut the power supply wires to my house.",
        # Arson / fire / vehicle damage patterns
        "Someone set fire to my car parked outside my house and it was completely burned down.",
        "My vehicle was deliberately set on fire by unknown persons and completely destroyed.",
        "Someone burned my car parked in front of my house causing complete destruction.",
        "Arsonists set my motorcycle on fire outside my building last night.",
        "My car was set on fire deliberately and burnt completely outside my home.",
        "Someone poured petrol on my vehicle and set it on fire destroying it completely.",
        "My parked vehicle was burned down by unknown people in an act of deliberate destruction.",
        "Someone deliberately burned my car that was parked near my house last night.",
        "My property was destroyed by fire set deliberately by someone outside my residence.",
        "Unknown persons set fire to my vehicle causing complete damage to it.",
    ]

    other_samples = [
        "I had a disagreement with a neighbor over parking space.",
        "There is a noise complaint I would like to formally register.",
        "I want to report a suspicious person loitering in my area.",
        "I found an abandoned vehicle near my building.",
        "My employer is not giving me my relieving letter.",
        "There is a stray dog that bit someone in my colony.",
        "I need to report a road accident I witnessed.",
        "A shop is operating without a valid license.",
        "I want to complain about poor sanitation in my locality.",
        "A political rally is blocking traffic and causing inconvenience.",
    ]

    for s in cyber_samples:    data.append((s, "CYBER_CRIME"))
    for s in fraud_samples:    data.append((s, "FRAUD"))
    for s in theft_samples:    data.append((s, "THEFT"))
    for s in violence_samples: data.append((s, "VIOLENCE"))
    for s in harassment_samples: data.append((s, "HARASSMENT"))
    for s in drug_samples:     data.append((s, "DRUG_OFFENSE"))
    for s in property_samples: data.append((s, "PROPERTY_CRIME"))
    for s in other_samples:    data.append((s, "OTHER"))

    return data


# ── Classifier ─────────────────────────────────────────────────────────────────

class CrimeClassifier:
    def __init__(self):
        self.pipeline = None
        self.label_to_idx = {}
        self.idx_to_label = {}
        self.is_trained = False
        self.accuracy = 0.0
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            saved = joblib.load(MODEL_PATH)
            self.pipeline     = saved["pipeline"]
            self.label_to_idx = saved["label_to_idx"]
            self.idx_to_label = saved["idx_to_label"]
            self.accuracy     = saved["accuracy"]
            self.is_trained   = True
            print(f"[CrimeClassifier] Model loaded from {MODEL_PATH} (accuracy: {self.accuracy:.2%})")
        else:
            self._train()

    def _train(self):
        print("[CrimeClassifier] Training model on synthetic data...")
        raw = generate_training_data()
        texts  = [r[0] for r in raw]
        labels = [r[1] for r in raw]

        unique_labels = sorted(set(labels))
        self.label_to_idx = {l: i for i, l in enumerate(unique_labels)}
        self.idx_to_label = {i: l for l, i in self.label_to_idx.items()}

        y = [self.label_to_idx[l] for l in labels]

        # Augment training data with simple variants
        augmented = []
        for text, label in raw:
            augmented.append((text, label))
            words = text.split()
            if len(words) > 5:
                augmented.append((' '.join(words[1:] + [words[0]]), label))
                augmented.append((text.replace('my', 'our').replace('I', 'We'), label))
        raw = augmented
        texts  = [r[0] for r in raw]
        labels = [r[1] for r in raw]
        y = [self.label_to_idx[l] for l in labels]

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 3),
                max_features=15000,
                sublinear_tf=True,
                min_df=1,
            )),
            ("clf", RandomForestClassifier(
                n_estimators=300,
                max_depth=None,
                random_state=42,
                class_weight="balanced",
                n_jobs=-1,
            )),
        ])

        X_train, X_test, y_train, y_test = train_test_split(
            texts, y, test_size=0.2, random_state=42, stratify=y
        )
        self.pipeline.fit(X_train, y_train)

        preds = self.pipeline.predict(X_test)
        correct = sum(p == t for p, t in zip(preds, y_test))
        self.accuracy = correct / len(y_test)

        label_names = [self.idx_to_label[i] for i in range(len(unique_labels))]
        print(classification_report(y_test, preds, target_names=label_names))
        print(f"[CrimeClassifier] Accuracy: {self.accuracy:.2%}")

        joblib.dump({
            "pipeline":     self.pipeline,
            "label_to_idx": self.label_to_idx,
            "idx_to_label": self.idx_to_label,
            "accuracy":     self.accuracy,
        }, MODEL_PATH)

        self.is_trained = True
        print(f"[CrimeClassifier] Model saved to {MODEL_PATH}")

    def _compute_severity(self, category: str, confidence: float) -> dict:
        cfg = SEVERITY_CONFIG.get(category, {"base": 2, "label": "LOW"})
        base = cfg["base"]
        # Adjust score slightly based on confidence
        adjustment = round((confidence - 70) / 30 * 1.5) if confidence > 70 else -1
        score = max(1, min(10, base + adjustment))
        label = SEVERITY_LABELS[score]
        return {"score": score, "label": label}

    def predict(self, text: str) -> dict:
        proba = self.pipeline.predict_proba([text])[0]
        top_idx = int(np.argmax(proba))
        category = self.idx_to_label[top_idx]
        confidence = round(float(proba[top_idx]) * 100, 1)

        severity = self._compute_severity(category, confidence)

        all_scores = {
            self.idx_to_label[i]: round(float(p) * 100, 2)
            for i, p in enumerate(proba)
        }

        return {
            "category":        category,
            "category_label":  CATEGORIES.get(category, category),
            "confidence":      confidence,
            "severity":        severity["label"],
            "severity_score":  severity["score"],
            "explanation":     EXPLANATIONS.get(category, EXPLANATIONS["OTHER"]),
            "legal_next_steps": LEGAL_STEPS.get(category, LEGAL_STEPS["OTHER"]),
            "all_scores":      all_scores,
        }

    def get_categories(self):
        return [{"key": k, "label": v} for k, v in CATEGORIES.items()]

    def get_model_stats(self):
        return {
            "model_type": "GradientBoostingClassifier + TF-IDF (1-3 ngrams)",
            "num_categories": len(CATEGORIES),
            "training_accuracy": round(self.accuracy * 100, 2),
            "model_file": MODEL_PATH,
        }

# This section intentionally left for future data augmentation
