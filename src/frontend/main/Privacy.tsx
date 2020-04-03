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
        Hanke tehdään avoimen lähdekoodin periaatteella. HS:n ja muiden medioiden käyttöön annetaan kyselylomake, jonka
        avulla tietoja kerätään. Kerättävästä datasta tehdään visualisointeja upotettavina elementteinä. Näitä
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
    </Container>
  );
};

export default Privacy;
