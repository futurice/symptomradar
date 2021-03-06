import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';

const Container = styled.div`
  padding: 24px;
  max-width: 648px;
  margin: 0 auto;
`;

const List = styled.ul`
  margin-top: 0;
  padding-left: 18px;
`;

const Privacy = (props: RouteComponentProps) => {
  return (
    <Container>
      <h1>Oiretutka-palvelun kuvaus ja tietosuojakuvaus</h1>
      <h2>Yleinen kuvaus</h2>
      <p>
        Oiretutka on HS:n ja teknologiayhtiö Futuricen yhteinen hanke, jonka tarkoituksena on kerätä suomalaisilta
        tietoja heidän kokemistaan oireista. Tiedon avulla on tarkoitus ymmärtää paremmin, miten koronavirus
        mahdollisesti leviää Suomessa. Palvelua ei ole tarkoitettu yksittäisen henkilön opastamiseksi terveyteensä
        liittyen tai ohjaamiseksi terveydenhuoltoon. Kerätyn tiedon avulla HS ja muut mediat tekevät journalismia, jonka
        avulla kuvataan koronaviruksen mahdollista leviämistä Suomessa. HS ja muut tiedotusvälineet käsittelevät tietoja
        ainoastaan toimituksellisessa tarkoituksessa.
      </p>
      <p>
        Hanke tehdään avoimen lähdekoodin periaatteella. HS:n ja muiden medioiden käyttöön annetaan medioiden sivuille
        upotettava kyselylomake, jonka avulla tietoja kerätään. Kerättävästä datasta tehdään visualisointeja
        upotettavina elementteinä. Näitä avulla tietoja kerätään. HS toimii tietojen käsittelyn osalta
        rekisterinpitäjänä. Kyselylomaketta sivuilleen upottavat muut mediat eivät kerää tietoja, vaan tiedot
        tallentuvat HS:n palvelimelle. Kerättävästä datasta tehdään visualisointeja upotettavina elementteinä. Näitä
        upotettavia elementtejä voivat käyttää kaikki hankkeeseen osallistuvat mediat. Hankkeen keräämiä tietoja jaetaan
        mahdollisimman avoimesti. Helsingin Sanomat omistaa hankkeessa kerätyt tiedot. Tietoja käsitellään alla
        kuvatulla tavalla. Tietojen käsittelyä toimituksellisessa kontekstissa kuvataan Helsingin Sanomien{' '}
        <a href="https://oma.sanoma.fi/asiakastuki/helsingin-sanomat/hs-tilausehdot/tietosuojakuvaus">
          tietosuojakuvauksessa.
        </a>
      </p>
      <h2>Mitä tietoja palvelu tallentaa ja mihin</h2>
      <h3>Palvelusta kerätään käyttäjältä ja tämän päätelaitteelta seuraavia tietoja:</h3>
      <List>
        <li>
          Käyttäjän vastatessa kyselyyn tämän laitteelle tallennetaan uniikki, satunnainen tunniste. Tämä tunniste
          tallennetaan selaimen tai sovelluksen selainikkunan muistiin. Tätä tunnistetta käytetään kyselyä uudelleen
          täytettäessä päätelaitteen tunnistamiseen, jotta palvelussa voidaan seurata oireiden mahdollista kehittymistä.
          Tunniste poistetaan laitteelta 14 päivän jälkeen. Tunnistetta ei pysty lukemaan muut sivustot kuin sen
          asettanut Oiretutka.fi. Tunniste lähetetään palvelimelle ja tallennetaan sinne salakirjoitettuna.
        </li>
      </List>
      <h3>Palvelimelle lähetetään seuraavat lomakkeen tiedot:</h3>
      <List>
        <li>Satunnainen tunniste</li>
        <li>Lomakkeen täyttämiseen kulunut aika</li>
        <li>Cloudfront-välimuistipalvelun tarjoama maakoodi, jonka avulla vastaajan kotimaa tunnistetaan</li>
      </List>
      <p>Palvelimelle lähetetään seuraavat vastaajan täyttämät tiedot:</p>
      <List>
        <li>Kaikki oirekyselyn vastaukset</li>
        <li>Postinumero</li>
        <li>Ikäryhmä kymmenen vuoden ryhmissä</li>
        <li>Sukupuoli (mies/nainen/muu)</li>
      </List>
      <h3>Palvelimelle lähetetään seuraavat tekniset tiedot väärinkäytösten estämiseksi:</h3>
      <List>
        <li>IP-osoite</li>
        <li>Selaimen versiotunniste (useragent)</li>
      </List>
      <p>
        Palvelimen päässä satunnainen tunniste, IP-osoite ja versiotunniste salakirjoitetaan ja käyttäjän tiedot jaetaan
        useampaan tietokantaan. Oiretiedot ja tekniset tiedot jaetaan erillisiin tietokantoihin siten, että
        salakirjoitettua IP-osoitetta eikä selaimen versiotunnistetta voida yhdistää yksittäisen vastauslomakkeen
        tietoihin. Tallennusvaiheessa lomakkeen tietoihin lisätään tieto siitä, kuinka monta kertaa samanlaisesta
        osoitteesta on lähiaikoina lähetetty vastauksia. Tämä tehdään väärinkäytösten estämiseksi. Postinumero
        tallennetaan vain sellaisista postinumeroalueista, joissa on yli 100 asukasta. Pienemmät postinumeroalueet
        yhdistetään kunnan suurimpaan postinumeroalueeseen.
      </p>
      <h2>Palvelinympäristön kuvaus ja tietoturvallisuus</h2>
      <p>
        Oiretutka-palvelu on toteutettu omalle muista Sanoman palveluista erilliselle AWS-tililleen. Sinne on pääsy
        ainoastaan rajoitetulla määrällä HS:n ja Futuricen henkilökuntaa.
      </p>
      <h2>Avoimen datan julkaiseminen ja datan luovuttaminen kolmansille osapuolille</h2>

      <p>
        Oiretutka-palvelussa kerättyjä tietoja julkaistaan aggregoituna tai anonymisoituna avoimena datana. Dataa saa
        käyttää tieteelliseen tutkimukseen ja toimituksellisiin käyttötarkoituksiin. Dataa ei saa käyttää muihin
        kaupallisiin tarkoituksiin. Tiedon keruun ja julkaisun tarkoitus on analysoida epidemiaa uutisiin sekä tarjota
        mahdollisuus analysointiin laajemmalle terveydestä ja epidemiasta kiinnostuneiden joukolle sekä muille
        medioille.
      </p>

      <p>
        Datan käyttäjät vastaavat itse omasta datan käytöstään. HS ja Oiretutkaan osallistuvat eivät vastaa datan
        hyödyntäjien datan käytöstä. HS ei myöskään vastaa datan oikeellisuudesta tai muista dataan liittyvistä asioista
        datan hyödyntäjille.
      </p>

      <p>HS:llä on oikeus lopettaa datan jakaminen ja estää siihen pääsy ennalta ilmoittamatta. </p>

      <p>
        Oiretutka-palveluissa eri medioissa kerättyjä tietoja julkaistaan aluekohtaisina yhteenvetoina ja anonymisoituna
        avoimena datana. Anonymisointi tarkoittaa, että yksittäisen vastaajan henkilöllisyyttä ei voi päätellä tiedon
        karkeutuksen jälkeen.
      </p>

      <p>Yhteenvedot tuloksista postinumeroalueittain ja kaupungeittain, sisältää seuraavat tiedot:</p>
      <List>
        <li>Postinumeroalue, kaupunki ja alueen väkiluku (Esim. 00100, Helsinki, 18427)</li>
        <li>Havaintojen kokonaismäärä alueella (Esim. 1189)</li>
        <li>
          Ilmoitettujen oireiden määrät eri oiretyypeittäin (Esimerkiksi kuume: Ei kuumetta 1033, hieman kuumetta 123,
          korkea kuume 33)
        </li>
        <li>Julkaistaan vain postinumeroalueilta, joissa asuu vähintään 100 henkeä</li>
        <li>Ei sisällä tietoja yksittäisistä vastaajista</li>
        <li>
          Datasta poistetaan seuraavat vastausrivit ennen yhteenvedon tekemistä: ulkomailta tulleet vastaukset; ne
          vastaukset jossa on virheellinen postinumero
        </li>
      </List>
      <p>Yksittäiset vastaukset julkaistaan anonymisoituna. Data sisältää seuraavat tiedot:</p>
      <List>
        <li>Yksittäisen vastaajan kaikki vastaukset oireista, sisältäen oireiden keston päivinä</li>
        <li>
          Laitteella luotu satunnainen tunniste UUID salakirjoitettuna kuten Oiretutkan tietokannassa. Tämän avulla
          datasta voi tunnistaa ne vastaajat, jotka ovat vastanneet useana peräkkäisenä päivää. Tunnisteen avulla mikään
          taho ei voi päätellä vastaajan henkilöllisyyttä.
        </li>
        <li>Vastauksen päivämäärä ja kellonaika tunnin tarkkuudella</li>
        <li>Ikä kahtena luokkana (alle 50v, yli 50v)</li>
        <li>Sukupuoli kahtena luokkana (mies, nainen. Muu yhdistetään mies-luokkaan)</li>
        <li>
          Postinumeroalue. Jos postinumeroalueella asuu alle 500 henkeä, yhdistetään se kunnan väkiluvultaan suurimpaan
          postinumeroon.
        </li>
        <li>
          Datasta poistetaan seuraavat vastausrivit: ulkomailta tulleet vastaukset; ne vastaukset jossa on virheellinen
          postinumero
        </li>
      </List>
      <p>
        Lisäksi hankkeeseen osallistuville medioille voidaan luovuttaa Oiretutkan tietokannan sisältämää dataa
        journalistiseen käyttöön erillisellä sopimuksella. Muuten sopimuksella luovutettava data samanlainen kuin avoin
        data, mutta sisältää ikäryhmät, sukupuolet ja postinumerot kuten ne on lomakkeessa ilmoitettu. Lisäksi dataan
        liitetään Oiretutkan sovellusversio ja vastaajan maakoodi. Sopimuksella velvoitetaan datan saajaa huolehtimaan
        datan turvallisesta säilytyksestä ja kielletään datan julkistaminen avointa dataa tarkemmin.
      </p>
    </Container>
  );
};

export default Privacy;
