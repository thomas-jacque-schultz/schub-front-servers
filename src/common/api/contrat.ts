// Généré par scripts/contrat.mjs depuis openapi/core.json : ne pas modifier à la main.
export interface paths {
  "/augur/patterns": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["list_1"];
    put?: never;
    post: operations["draft"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/augur/patterns/{key}/rollback": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["rollback"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/augur/patterns/{key}/versions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["history"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/augur/patterns/{key}/versions/{version}/activate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["activate"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/augur/patterns/{key}/versions/{version}/impact": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["impact"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/deployments": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all_5"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all_4"];
    put?: never;
    post: operations["create_3"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers/games": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["games_2"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers/public-status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["publicStatus"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byId_3"];
    put: operations["update_3"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers/{slug}/start": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["start"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/game-servers/{slug}/stop": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["stop"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/accounts-by-rank": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["accountsByRank"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/crawler": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["crawler"];
    put: operations["toggleCrawler"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/history-window": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["updateHistoryWindow"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/load": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["load"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/pause": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["pause"];
    put: operations["updatePause"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/riot-data": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["inventory"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/riot-data/invalidate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["invalidate"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/seo-creators": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["seoCreators"];
    put: operations["replaceSeoCreators"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ingest/summary": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["summary"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/lol/references/champions/{championId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["champion"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/lol/references/{position}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["grid"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["me"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/display-name": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["changeDisplayName"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/session-summaries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["changeSessionSummaries"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/session-summary": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["sessionSummary"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/stats": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["mine_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/stats/findings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["findings_2"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/stats/games": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["games_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/stats/games/{matchId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["game_2"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/stats/games/{matchId}/findings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["gameFindings_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/history-window": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["historyWindow"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/indexable": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["indexable"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/search": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["search"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["page"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/collect": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["collect"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/companions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["companions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/findings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["findings_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/games": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["games"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/games/{matchId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["game_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/games/{matchId}/findings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["gameFindings"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{riotId}/trace": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["trace"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/port-forwarding/reconcile": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["reconcile"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/port-forwarding/rules": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["listRules"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/port-forwarding/static-rules": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["listStaticRules"];
    put?: never;
    post: operations["createStaticRule"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/port-forwarding/static-rules/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations["deleteStaticRule"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/port-forwarding/status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["status"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/premadelab/session-summary-test": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["recent"];
    put?: never;
    post: operations["send"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/premadelab/settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["get"];
    put: operations["update_2"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/public-teams": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["listed"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/public-teams/{teamId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byId_2"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quiz/questions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["active"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quiz/questions/all": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all_3"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quiz/questions/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["save"];
    post?: never;
    delete: operations["delete_3"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/roles": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all_2"];
    put?: never;
    post: operations["create_2"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/roles/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["update_1"];
    post?: never;
    delete: operations["delete_2"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["mine"];
    put?: never;
    post: operations["create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/claim": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["claim"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byId"];
    put: operations["rename"];
    post?: never;
    delete: operations["delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/champion-pool": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byTeam"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/champion-pool/mastery-floor": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["setMasteryFloor"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/champion-pool/roles/{role}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["setChampions"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/compositions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all_1"];
    put?: never;
    post: operations["create_1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/compositions/{compositionId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byId_1"];
    put: operations["update"];
    post?: never;
    delete: operations["delete_1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/members": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["addMember"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/members/{memberId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["updateMember"];
    post?: never;
    delete: operations["removeMember"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/members/{memberId}/hidden": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["setMemberHidden"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/public": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["setPublic"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/sessions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["list"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/sessions/detect": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["detect"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/compositions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["compositions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/draft": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["draft_1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/findings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["findings"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/games/{matchId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["game"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/opposition": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["opposition"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/players": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["players"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["refreshStatus"];
    put?: never;
    post: operations["refresh"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/synergy": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["synergy"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/stats/team": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["team"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/teams/{teamId}/training-slots": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["setTrainingSlots"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/tier-combos/{tier}/{kind}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["of"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["all"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/by-discord/{discordId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["byDiscordId"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/by-discord/{discordId}/permissions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["effectivePermissions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/me/riot-account": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["myRiotAccount"];
    put: operations["linkMyRiotAccount"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/me/riot-account/suggestions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["suggestRiotAccounts"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/stats": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["stats"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/{id}/activity": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["activity"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/{id}/identity": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["identity"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/{id}/role": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["assignRole"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AccountLinksDto: {
      discord: boolean;
      riot: boolean;
    };
    AccountsByRankDto: {
      available: boolean;
      rows: components["schemas"]["Row"][];
    };
    Active: {
      /** Format: int64 */
      last24h: number;
      /** Format: int64 */
      last30d: number;
      /** Format: int64 */
      last7d: number;
    };
    AddMemberRequest: {
      coach: boolean;
      riotGameName: string;
      riotPuuid?: string | null;
      riotTagLine: string;
      roles: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[];
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
    };
    AssignRoleRequest: {
      roleId: string;
    };
    At15Dto: {
      /** Format: int32 */
      assists: number;
      /** Format: int32 */
      cs: number;
      /** Format: int32 */
      damageToChampions: number;
      /** Format: int32 */
      deaths: number;
      /** Format: int32 */
      gold: number;
      /** Format: int32 */
      kills: number;
      /** Format: int32 */
      xp: number;
    };
    AverageRankDto: {
      /** Format: int32 */
      counted: number;
      division: string | null;
      tier: string;
      /** Format: double */
      value: number;
    };
    Backfill: {
      /** Format: int64 */
      collected: number;
      /** Format: int32 */
      found: number;
      /** Format: date-time */
      since: string;
    };
    Ban: {
      /** Format: int32 */
      championId: number;
      championKey: string | null;
      championName: string | null;
      /** Format: int64 */
      gamesAgainst: number;
      iconUrl: string | null;
      /** Format: double */
      impact: number;
      lowConfidence: boolean;
      /** Format: double */
      presence: number;
      /** Format: double */
      winRateAgainst: number;
      /** Format: int64 */
      winsAgainst: number;
    };
    BestDuo: {
      a: string;
      b: string;
      /** Format: double */
      delta: number;
      /** Format: int64 */
      games: number;
      /** Format: int64 */
      wins: number;
    };
    Bound: {
      /** Format: double */
      high: number;
      /** Format: double */
      low: number;
    };
    ChampionCatalogEntryDto: {
      /** Format: int32 */
      championId: number;
      championKey: string;
      iconUrl: string;
      name: string;
    };
    ChampionGridDto: {
      /** Format: int32 */
      championId: number;
      /** Format: date-time */
      computedAt: string;
      group: string | null;
      metrics: {
        [key: string]: components["schemas"]["ChampionGridMetric"];
      };
      patches: string[];
      percentiles: number[];
    };
    ChampionGridMetric: {
      /** Format: int64 */
      count: number;
      polarity: string;
      values: number[];
    };
    ChampionPoolColumnDto: {
      champions: components["schemas"]["ChampionPoolEntryDto"][];
      /** Format: int32 */
      hiddenByFloor: number;
      /** @enum {string} */
      role: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
      unavailableMembers: components["schemas"]["ChampionPoolMemberDto"][];
    };
    ChampionPoolDto: {
      catalog: components["schemas"]["ChampionCatalogEntryDto"][];
      columns: components["schemas"]["ChampionPoolColumnDto"][];
      /** Format: date-time */
      generatedAt: string;
      /** Format: int32 */
      masteryFloor: number;
      patch: string | null;
      startingSelection: boolean;
      teamId: string;
      /** Format: int32 */
      teamMasteryFloor: number;
      teamName: string;
      viewerCanEdit: boolean;
      viewerMemberId: string | null;
    };
    ChampionPoolEntryDto: {
      /** Format: int32 */
      championId: number;
      championKey: string;
      iconUrl: string | null;
      name: string | null;
      players: components["schemas"]["ChampionPoolMemberDto"][];
      /** Format: int32 */
      setAsideByFloor: number;
    };
    ChampionPoolMemberDto: {
      avatarUrl: string | null;
      displayName: string | null;
      /** Format: int64 */
      games: number | null;
      /** Format: date-time */
      lastPlayedAt: string | null;
      linked: boolean;
      /** Format: int32 */
      masteryLevel: number | null;
      /** Format: int32 */
      masteryPoints: number | null;
      memberId: string;
      /** Format: date-time */
      observedAt: string | null;
      riotGameName: string | null;
      riotTagLine: string | null;
      /** @enum {string} */
      state:
        | "MAITRISES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "MAITRISES_INDISPONIBLES"
        | "CATALOGUE_INDISPONIBLE"
        | "AUCUNE_MAITRISE";
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
      /** Format: double */
      winRate: number | null;
    };
    Combo: {
      /** Format: double */
      expected: number | null;
      /** Format: int64 */
      games: number;
      kind: string;
      lowConfidence: boolean;
      /** Format: double */
      lowerBound: number;
      picks: components["schemas"]["Pick"][];
      /** Format: int64 */
      referenceGames: number | null;
      /** Format: double */
      referenceWinRate: number | null;
      /** Format: double */
      winRate: number;
      /** Format: int64 */
      wins: number;
    };
    CommentRequest: {
      comment: string;
    };
    Companion: {
      /** Format: int64 */
      games: number;
      riotId: string;
      slug: string;
      /** Format: double */
      winRate: number;
      /** Format: int64 */
      wins: number;
      /** Format: int64 */
      withoutGames: number;
      /** Format: double */
      withoutWinRate: number;
    };
    CompanionsDto: {
      companions: components["schemas"]["Companion"][];
      /** Format: int32 */
      minimumGames: number;
      month: string;
      suggestedTeam: string[];
    };
    CompositionDto: {
      bans: string[];
      /** Format: date-time */
      createdAt: string;
      id: string;
      name: string;
      notes: string | null;
      patch: string | null;
      slots: components["schemas"]["CompositionSlotDto"][];
      teamId: string;
      /** Format: date-time */
      updatedAt: string;
      viewerCanEdit: boolean;
    };
    CompositionRecordDto: {
      compositionId: string;
      /** Format: int64 */
      games: number;
      lowConfidence: boolean;
      matches: components["schemas"]["Game"][];
      /** Format: int64 */
      wins: number;
    };
    CompositionRequest: {
      bans: string[];
      name: string;
      notes?: string | null;
      patch?: string | null;
      slots: components["schemas"]["CompositionSlotRequest"][];
    };
    CompositionSlotDto: {
      alternatives: string[];
      championId: string | null;
      memberId: string | null;
      playerDisplayName: string | null;
      /** @enum {string} */
      role: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
    };
    CompositionSlotRequest: {
      alternatives: string[];
      championId: string;
      memberId?: string | null;
      /** @enum {string} */
      role: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
    };
    ConditionDto: {
      /** Format: double */
      from: number;
      signal: string;
      /** Format: double */
      to: number;
      /** @enum {string} */
      unit: "VALUE" | "PERCENTILE";
      /** Format: double */
      weight: number;
    };
    ConditionTraceDto: {
      /** Format: double */
      degree: number | null;
      /** Format: double */
      from: number;
      /** Format: double */
      observed: number | null;
      /** @enum {string} */
      role: "REQUIRED" | "OPTIONAL" | "EXCEPTION";
      signal: string;
      /** Format: double */
      to: number;
      /** @enum {string} */
      unit: "VALUE" | "PERCENTILE";
      /** Format: double */
      value: number | null;
    };
    Counts: {
      /** Format: int64 */
      analysed: number;
      /** Format: int64 */
      pending: number;
      /** Format: int64 */
      retrieved: number;
    };
    CrawlerDto: {
      available: boolean;
      /** Format: int64 */
      backgroundPending: number;
      /** Format: int64 */
      databaseBytes: number;
      enabled: boolean;
      /** Format: int64 */
      knownAccounts: number;
      /** Format: int32 */
      lastRoundAccounts: number;
      /** Format: date-time */
      lastRoundAt: string | null;
      running: boolean;
      storageAlert: boolean;
      /** Format: int64 */
      storageAlertBytes: number;
      switchable: boolean;
      /** Format: int64 */
      trackedAccounts: number;
    };
    CrawlerToggleRequest: {
      enabled: boolean;
    };
    Day: {
      /** Format: int64 */
      activeUsers: number;
      day: string;
      /** Format: int64 */
      searchers: number;
    };
    DiscordIdentityDto: {
      avatarUrl: string | null;
      id: string;
      username: string;
    };
    DisplayNameRequest: {
      displayName: string;
    };
    DraftAdviceDto: {
      avoid: components["schemas"]["Combo"][];
      bans: components["schemas"]["Ban"][];
      compositions: components["schemas"]["Combo"][];
      /** Format: int32 */
      duoThreshold: number;
      duos: components["schemas"]["Combo"][];
      /** Format: int32 */
      games: number;
      laneThreats: components["schemas"]["LaneThreat"][];
      toTry: components["schemas"]["Combo"][];
      /** Format: int32 */
      trioThreshold: number;
      trios: components["schemas"]["Combo"][];
    };
    Duo: {
      /** Format: double */
      delta: number | null;
      /** Format: double */
      expected: number | null;
      /** Format: int64 */
      games: number;
      memberA: string;
      memberB: string;
      nameA: string | null;
      nameB: string | null;
      /** Format: double */
      winRate: number | null;
      /** Format: int64 */
      wins: number;
    };
    EarlyGameDto: {
      ganks: components["schemas"]["GankDto"][];
      ourJungler: components["schemas"]["JunglePresenceDto"] | null;
      ourObjectives: components["schemas"]["ObjectivesDto"];
      theirJungler: components["schemas"]["JunglePresenceDto"] | null;
      theirObjectives: components["schemas"]["ObjectivesDto"];
    };
    EvaluationDto: {
      conditions: components["schemas"]["ConditionTraceDto"][];
      /** Format: double */
      degree: number;
      emitted: boolean;
      excepted: boolean;
      patternKey: string;
      /** Format: int32 */
      version: number;
    };
    Example: {
      /** Format: double */
      currentDegree: number;
      /** Format: double */
      draftDegree: number;
      subject: string;
      tier: string;
    };
    FieldDto: {
      inline: boolean;
      name: string;
      value: string;
    };
    FindingDto: {
      /** @enum {string} */
      category: "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
      /** Format: double */
      confidence: number;
      context: {
        [key: string]: string;
      };
      evidence: components["schemas"]["ConditionTraceDto"][];
      experimental: boolean;
      label: {
        [key: string]: string;
      };
      limits: {
        [key: string]: string;
      };
      /** @enum {string} */
      nature: "ACTION" | "CONSEQUENCE";
      pattern: string;
      /** @enum {string} */
      polarity: "STRENGTH" | "WEAKNESS" | "NEUTRAL";
      sentence: {
        [key: string]: string;
      };
    };
    FooterDto: {
      text: string;
    };
    Game: {
      /** Format: int64 */
      durationSeconds: number;
      matchId: string;
      /** Format: date-time */
      startedAt: string;
      win: boolean;
    };
    GameDto: {
      iconUrl: string;
      label: string;
      name: string;
    };
    /** @description Un joueur d'une partie : ses indicateurs sur la partie et sa moyenne au mÃªme poste. */
    GamePlayerMetricsDto: {
      average: components["schemas"]["StatLineDto"] | null;
      /** Format: int32 */
      championId: number;
      /** @description ClÃ© de mÃ©trique â valeur sur la partie, calculÃ©e comme la grille GAME. */
      game: {
        [key: string]: number;
      };
      position: string | null;
      /**
       * Format: int32
       * @description Avec championId, dÃ©signe le joueur dans la partie.
       */
      side: number;
      /** @description Palier tenu Ã  la date de la partie. */
      tier: string | null;
      tierEstimated: boolean;
    };
    GameServerCommandFailureDto: {
      /** @enum {string} */
      action: "start" | "stop";
      /** Format: date-time */
      at: string | null;
      message: string | null;
    };
    GameServerDto: {
      /** Format: int32 */
      deploymentId: number | null;
      description: string | null;
      game: string | null;
      gameIconUrl: string | null;
      gameLabel: string | null;
      id: string | null;
      installation: string | null;
      lastCommandFailure:
        components["schemas"]["GameServerCommandFailureDto"] | null;
      /** Format: date-time */
      lastStatusChangeAt: string | null;
      /** Format: date-time */
      lastStatusCheckAt: string | null;
      name: string | null;
      /** Format: int32 */
      playersMax: number | null;
      ports: components["schemas"]["GameServerPortDto"][] | null;
      referentIds: string[] | null;
      referents: components["schemas"]["GameServerReferentDto"][] | null;
      slug: string | null;
      status: string | null;
      statusHistory:
        components["schemas"]["GameServerStatusHistoryEntryDto"][] | null;
      urlConnection: string | null;
      version: string | null;
      viewerCanControl: boolean;
    };
    GameServerMemberDto: {
      description: string | null;
      game: string | null;
      gameIconUrl: string | null;
      gameLabel: string | null;
      id: string | null;
      installation: string | null;
      lastCommandFailure:
        components["schemas"]["GameServerCommandFailureDto"] | null;
      /** Format: date-time */
      lastStatusChangeAt: string | null;
      /** Format: date-time */
      lastStatusCheckAt: string | null;
      name: string | null;
      /** Format: int32 */
      playersMax: number | null;
      referents: components["schemas"]["GameServerReferentDto"][] | null;
      slug: string | null;
      status: string | null;
      statusHistory:
        components["schemas"]["GameServerStatusHistoryEntryDto"][] | null;
      urlConnection: string | null;
      version: string | null;
      viewerCanControl: boolean;
    };
    GameServerPortDto: {
      lanIp: string | null;
      /** Format: int32 */
      lanPort: number | null;
      proto: string;
      /** Format: int32 */
      wanPort: number;
    };
    GameServerReferentDto: {
      discordId: string | null;
      displayName: string | null;
      id: string;
    };
    GameServerStatusHistoryEntryDto: {
      /** Format: date-time */
      startedAt: string;
      status: string | null;
    };
    GankDto: {
      /** Format: int32 */
      alliesLost: number;
      decisive: boolean;
      /** Format: int32 */
      enemiesLost: number;
      fallenMemberIds: string[];
      /** @enum {string} */
      lane: "TOP" | "MID" | "BOT";
      objectiveFollowUp: boolean;
      ours: boolean;
      /** @enum {string} */
      outcome: "KILL" | "TRADE" | "SURVIVED" | "COUNTER";
      /** Format: int32 */
      second: number;
      targetMemberIds: string[];
    };
    HistoryWindowDto: {
      /** Format: int32 */
      maxAgeDays: number;
      /** Format: int32 */
      maxGames: number;
      /** Format: int32 */
      minGames: number;
    };
    ImpactDto: {
      /** Format: int32 */
      appearing: number;
      byTier: {
        [key: string]: number[];
      };
      /** Format: int32 */
      disappearing: number;
      examples: components["schemas"]["Example"][];
      /** Format: int32 */
      sampled: number;
      /** Format: int32 */
      unchanged: number;
    };
    IndexablePlayerDto: {
      featured: boolean;
      riotId: string;
    };
    IngestLoadDto: {
      available: boolean;
      /** Format: double */
      callsPerMinute: number;
      /**
       * Format: duration
       * @example PT2H36M20S
       */
      estimatedDrain: string | null;
      /** Format: date-time */
      estimatedReadyAt: string | null;
      /** Format: int64 */
      failed: number;
      /** Format: int64 */
      pending: number;
      /** Format: int64 */
      running: number;
      /**
       * Format: duration
       * @example PT2H36M20S
       */
      throttledFor: string | null;
    };
    IngestPauseDto: {
      available: boolean;
      paused: boolean;
      /** Format: int64 */
      running: number;
      /** Format: date-time */
      updatedAt: string | null;
    };
    IngestPauseRequest: {
      paused: boolean;
    };
    IngestSummaryDto: {
      available: boolean;
      matches: components["schemas"]["Counts"];
      profiles: components["schemas"]["Counts"];
    };
    JunglePresenceDto: {
      /** Format: int32 */
      botMinutes: number;
      memberId: string | null;
      /** Format: int32 */
      midMinutes: number;
      /** @enum {string} */
      strongSide: "TOP" | "BOT" | "BALANCED";
      /** Format: int32 */
      topMinutes: number;
    };
    LaneThreat: {
      /** Format: int32 */
      championId: number;
      championKey: string | null;
      championName: string | null;
      /** Format: int64 */
      games: number;
      /** Format: double */
      goldDiffAt15: number;
      iconUrl: string | null;
      memberId: string;
      memberName: string | null;
      role: string;
    };
    Line: {
      champions: components["schemas"]["TierComboChampion"][];
      /** Format: int64 */
      games: number;
      /** Format: double */
      lowerBound: number;
      /** Format: double */
      winRate: number;
      /** Format: int64 */
      wins: number;
    };
    Listed: {
      id: string;
      name: string;
    };
    MasteryDto: {
      /** Format: int32 */
      championId: number;
      championName: string | null;
      iconUrl: string | null;
      /** Format: int32 */
      level: number;
      /** Format: int32 */
      points: number;
    };
    MatchupDto: {
      ally: components["schemas"]["TeamGamePlayerDto"] | null;
      enemy: components["schemas"]["TeamGamePlayerDto"] | null;
      position: string;
      /** Format: double */
      rankGap: number | null;
    };
    MeDto: {
      discord: components["schemas"]["DiscordIdentityDto"];
      displayName: string;
      displayNameChosen: boolean;
      dmUnreachable: boolean;
      links: components["schemas"]["AccountLinksDto"];
      riot: components["schemas"]["RiotAccountDto"];
      role: components["schemas"]["RoleSummaryDto"];
      sessionSummaries: components["schemas"]["SessionSummariesDto"] | null;
      userId: string;
    };
    Member: {
      riotId: string;
      roles: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[];
      slug: string;
    };
    MemberEarlyDto: {
      /** Format: int32 */
      botMinutes: number;
      /** Format: int32 */
      deathsOnGank: number;
      displayName: string | null;
      /** Format: int32 */
      ganksCountered: number;
      /** Format: int32 */
      ganksDecisive: number;
      /** Format: int32 */
      ganksFaced: number;
      /** Format: int32 */
      ganksHeld: number;
      /** Format: int32 */
      ganksMade: number;
      /** Format: int32 */
      jungleGames: number;
      /** Format: int32 */
      laneGames: number;
      memberId: string;
      /** Format: int32 */
      midMinutes: number;
      presenceWith: components["schemas"]["PresenceWithDto"][];
      /** Format: int32 */
      topMinutes: number;
    };
    MetricReferenceDto: {
      bounds: {
        [key: string]: components["schemas"]["Bound"];
      };
      /** Format: int32 */
      minimumGames: number;
      /** Format: int32 */
      population: number;
      position: string;
      tier: string | null;
    };
    MyGamesDto: {
      /** Format: int32 */
      days: number | null;
      games: components["schemas"]["TeamGameDto"][];
      /** Format: date-time */
      generatedAt: string;
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
      /** Format: int64 */
      totalGames: number;
      truncated: boolean;
      viewerMemberId: string | null;
    };
    MyStatsDto: {
      champions: components["schemas"]["StatLineDto"][];
      coverage: components["schemas"]["StatsCoverageDto"] | null;
      /** Format: int32 */
      days: number | null;
      displayName: string | null;
      /** Format: date-time */
      generatedAt: string;
      ingest: components["schemas"]["RiotIngestProgressDto"] | null;
      months: components["schemas"]["StatLineDto"][];
      overall: components["schemas"]["StatLineDto"] | null;
      patches: components["schemas"]["StatLineDto"][];
      positions: components["schemas"]["StatLineDto"][];
      queues: components["schemas"]["StatLineDto"][];
      rankings: components["schemas"]["RankedStandingDto"][];
      references: components["schemas"]["RadarReferencesDto"] | null;
      riotGameName: string | null;
      riotTagLine: string | null;
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
    };
    ObjectivesDto: {
      /** Format: int32 */
      dragons: number;
      /** Format: int32 */
      grubs: number;
      /** Format: int32 */
      heralds: number;
    };
    PatternDto: {
      /** Format: date-time */
      activatedAt: string | null;
      author: string | null;
      /** @enum {string} */
      category: "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
      comment: string | null;
      /** Format: date-time */
      createdAt: string | null;
      exceptions: components["schemas"]["ConditionDto"][];
      experimental: boolean;
      key: string;
      label: {
        [key: string]: string;
      };
      limits: {
        [key: string]: string;
      };
      /** @enum {string} */
      nature: "ACTION" | "CONSEQUENCE";
      optional: components["schemas"]["ConditionDto"][];
      /** Format: double */
      optionalInfluence: number;
      /** @enum {string} */
      polarity: "STRENGTH" | "WEAKNESS" | "NEUTRAL";
      required: components["schemas"]["ConditionDto"][];
      /** @enum {string} */
      scope: "GAME" | "HABIT" | "TEAM";
      sentence: {
        [key: string]: string;
      };
      /** @enum {string} */
      status: "DRAFT" | "ACTIVE" | "RETIRED";
      /** Format: double */
      threshold: number;
      /** Format: int32 */
      version: number;
    };
    PatternRequest: {
      /** @enum {string} */
      category: "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
      comment: string;
      exceptions: components["schemas"]["ConditionDto"][];
      experimental: boolean;
      key: string;
      label: {
        [key: string]: string;
      };
      limits: {
        [key: string]: string;
      };
      /** @enum {string} */
      nature: "ACTION" | "CONSEQUENCE";
      optional: components["schemas"]["ConditionDto"][];
      /** Format: double */
      optionalInfluence: number;
      /** @enum {string} */
      polarity: "STRENGTH" | "WEAKNESS" | "NEUTRAL";
      required: components["schemas"]["ConditionDto"][];
      /** @enum {string} */
      scope: "GAME" | "HABIT" | "TEAM";
      sentence: {
        [key: string]: string;
      };
      /** Format: double */
      threshold: number;
    };
    Pick: {
      /** Format: int32 */
      championId: number;
      championKey: string | null;
      championName: string | null;
      iconUrl: string | null;
      memberId: string | null;
      memberName: string | null;
      role: string;
    };
    PlayerCollectDto: {
      /** @enum {string} */
      lane: "KNOWN" | "FAST" | "SLOW";
    };
    PlayerStatsDto: {
      avatarUrl: string | null;
      champions: components["schemas"]["StatLineDto"][];
      coverage: components["schemas"]["StatsCoverageDto"] | null;
      displayName: string | null;
      linked: boolean;
      memberId: string;
      months: components["schemas"]["StatLineDto"][];
      overall: components["schemas"]["StatLineDto"] | null;
      positions: components["schemas"]["StatLineDto"][];
      premade: components["schemas"]["StatLineDto"] | null;
      queues: components["schemas"]["StatLineDto"][];
      rankings: components["schemas"]["RankedStandingDto"][];
      references: components["schemas"]["RadarReferencesDto"] | null;
      riotGameName: string | null;
      riotTagLine: string | null;
      roles: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[];
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
    };
    PlayerSuggestionDto: {
      gameName: string;
      /** Format: date-time */
      lastPlayedAt: string | null;
      /** Format: int64 */
      matchCount: number;
      positions: string[];
      riotId: string;
      tagLine: string;
    };
    PoolChampionsRequest: {
      championKeys: string[];
    };
    PoolMasteryFloorRequest: {
      /** Format: int32 */
      masteryFloor: number;
    };
    PortForwardingReportDto: {
      applied: boolean;
      conflicts: string[];
      outcomes: components["schemas"]["RuleOutcomeDto"][];
      rejected: string[];
      skippedReason: string;
    };
    PortRuleDto: {
      lanIp: string;
      /** Format: int32 */
      lanPort: number;
      open: boolean;
      owner: string | null;
      /** @enum {string} */
      protocol: "TCP" | "UDP";
      providerId: string | null;
      /** Format: int32 */
      wanPortEnd: number;
      /** Format: int32 */
      wanPortStart: number;
    };
    PortainerStackDto: {
      /** Format: int32 */
      endpointId: number | null;
      /** Format: int32 */
      id: number;
      lastCommandFailure: components["schemas"]["GameServerCommandFailureDto"];
      name: string;
      /** Format: date-time */
      observedAt: string;
      running: boolean;
    };
    PositionOppositionDto: {
      /** Format: double */
      averageCsDiff15: number | null;
      /** Format: double */
      averageGap: number | null;
      /** Format: double */
      averageGoldDiff15: number | null;
      /** Format: int32 */
      games: number;
      /** Format: int32 */
      laneGames: number;
      /** Format: double */
      laneWinRate: number | null;
      position: string;
      versusStronger: components["schemas"]["TeamRecordDto"];
      versusWeaker: components["schemas"]["TeamRecordDto"];
    };
    PositionPlayedDto: {
      /** Format: int64 */
      matches: number;
      position: string;
    };
    PremadeLabSettingsDto: {
      /** Format: int32 */
      budgetWindowMinutes: number;
      /** Format: int32 */
      unknownPlayerBudget: number;
    };
    PresenceWithDto: {
      displayName: string | null;
      /** Format: int32 */
      games: number;
      memberId: string;
      /** Format: int32 */
      minutes: number;
      /** Format: int32 */
      totalMinutes: number;
    };
    PublicServerStatusDto: {
      game: string | null;
      name: string | null;
      status: string | null;
    };
    PublicTeamChampion: {
      /** Format: int32 */
      championId: number;
      /** Format: int64 */
      games: number;
      iconUrl: string;
      name: string;
      /** Format: int64 */
      wins: number;
    };
    PublicTeamDto: {
      bestDuo: components["schemas"]["BestDuo"];
      champions: components["schemas"]["PublicTeamChampion"][];
      /** Format: int64 */
      games: number;
      id: string;
      members: components["schemas"]["Member"][];
      /** Format: int64 */
      monthGames: number;
      /** Format: int64 */
      monthWins: number;
      name: string;
      /** Format: int64 */
      wins: number;
    };
    QuizQuestionDto: {
      active: boolean;
      date: string;
      en: components["schemas"]["QuizWordingDto"];
      fr: components["schemas"]["QuizWordingDto"];
      id: string;
      image: string | null;
      imagesChoix: string[][] | null;
      source: string;
      /** @enum {string} */
      theme: "PROS" | "MONDE" | "OBJETS" | "HISTOIRE" | "SKINS";
      /** Format: date-time */
      updatedAt: string;
    };
    QuizQuestionRequest: {
      active: boolean;
      date: string;
      en: components["schemas"]["QuizWordingDto"];
      fr: components["schemas"]["QuizWordingDto"];
      image?: string | null;
      imagesChoix?: string[][] | null;
      source: string;
      /** @enum {string} */
      theme: "PROS" | "MONDE" | "OBJETS" | "HISTOIRE" | "SKINS";
    };
    QuizWordingDto: {
      choix: string[];
      enonce: string;
      explication: string;
    };
    RadarReferencesDto: {
      met: components["schemas"]["MetricReferenceDto"] | null;
      position: string;
      tier: string | null;
    };
    RankedStandingDto: {
      division: string | null;
      hotStreak: boolean;
      inactive: boolean;
      /** Format: int32 */
      leaguePoints: number;
      /** Format: int32 */
      losses: number;
      /** Format: date-time */
      observedAt: string | null;
      queue: string | null;
      riotQueueType: string | null;
      tier: string | null;
      /** Format: int32 */
      wins: number;
    };
    RecentSessionDto: {
      /** Format: date */
      day: string;
      /** Format: int64 */
      games: number;
      planned: boolean;
      /** Format: date-time */
      startedAt: string;
      teamName: string;
      /** Format: int64 */
      wins: number;
    };
    ReferenceGridDistribution: {
      /** Format: int64 */
      count: number;
      counts: number[];
      /** Format: double */
      step: number;
    };
    ReferenceGridDto: {
      /** Format: date-time */
      computedAt: string;
      distributions: {
        [key: string]: components["schemas"]["ReferenceGridDistribution"];
      } | null;
      metrics: {
        [key: string]: components["schemas"]["ReferenceGridMetric"];
      };
      patches: string[];
      percentiles: number[];
      position: string;
      scope: string;
    };
    ReferenceGridMetric: {
      missingTiers: string[];
      polarity: string;
      rankMeans: {
        [key: string]: number;
      } | null;
      tiers: {
        [key: string]: components["schemas"]["Tier"];
      };
    };
    Resource: {
      /** Format: double */
      conversion: number | null;
      /** Format: double */
      damageShareInLosses: number | null;
      /** Format: double */
      damageShareInWins: number | null;
      /** Format: int64 */
      games: number;
      /** Format: int64 */
      gamesAbove: number;
      /** Format: int64 */
      gamesBelow: number;
      /** Format: double */
      goldShareInLosses: number | null;
      /** Format: double */
      goldShareInWins: number | null;
      /** Format: double */
      goldShareThreshold: number | null;
      position: string;
      /** Format: double */
      winRateAbove: number | null;
      /** Format: double */
      winRateBelow: number | null;
    };
    RiotAccountChangeDto: {
      /**
       * Format: duration
       * @example PT2H36M20S
       */
      estimatedDuration: string | null;
      /** Format: int32 */
      estimatedMatches: number;
      ingestRestarted: boolean;
      previousRiotId: string | null;
      riotId: string;
      rosterSlotsToClaim: boolean;
      statsReset: boolean;
    };
    RiotAccountDto: {
      change: components["schemas"]["RiotAccountChangeDto"];
      gameName: string | null;
      ingest: components["schemas"]["RiotIngestDto"] | null;
      /** Format: date-time */
      linkedAt: string | null;
      riotId: string | null;
      /** @enum {string} */
      state: "ABSENT" | "RESOLU" | "EN_ATTENTE_DE_RESOLUTION";
      tagLine: string | null;
    };
    RiotAccountRequest: {
      confirmChange: boolean;
      riotId: string;
    };
    RiotAccountSuggestionDto: {
      alreadyLinked: boolean;
      gameName: string;
      /** Format: date-time */
      lastPlayedAt: string | null;
      /** Format: int64 */
      matchCount: number;
      mine: boolean;
      /** Format: date-time */
      observedAt: string;
      positions: components["schemas"]["PositionPlayedDto"][];
      riotId: string;
      source: string;
      tagLine: string;
    };
    RiotDataInvalidationDto: {
      /** Format: int32 */
      accountsToResolve: number;
      /** Format: int64 */
      findings: number;
      /** Format: int64 */
      riotDocuments: number;
    };
    RiotDataInvalidationRequest: {
      confirmation: string;
    };
    RiotDataInventoryDto: {
      available: boolean;
      /** Format: int64 */
      findings: number;
      /** Format: int64 */
      linkedAccounts: number;
      /** Format: int64 */
      riotDocuments: number;
      /** Format: int64 */
      teamSlots: number;
      /** Format: int64 */
      teams: number;
    };
    RiotIngestDto: {
      backfill: components["schemas"]["Backfill"] | null;
      /** Format: date-time */
      estimatedReadyAt: string | null;
      /** Format: int64 */
      pending: number;
      /** Format: int64 */
      running: number;
    };
    RiotIngestProgressDto: {
      /** Format: date-time */
      estimatedReadyAt: string | null;
      /** Format: int64 */
      pending: number;
      /** Format: int64 */
      running: number;
    };
    RoleDto: {
      id: string;
      name: string;
      permissions: (
        | "SERVER_VIEW"
        | "SERVER_INFRA_VIEW"
        | "SERVER_START"
        | "SERVER_STOP"
        | "SERVER_CONTROL_ALL"
        | "SERVER_CREATE"
        | "SERVER_EDIT"
        | "SERVER_DELETE"
        | "PORT_VIEW"
        | "PORT_RULE_EDIT"
        | "DISCORD_CHANNEL_MANAGE"
        | "USER_VIEW"
        | "USER_ROLE_ASSIGN"
        | "INGEST_VIEW"
        | "INGEST_MANAGE"
        | "TEAM_CREATE"
        | "TEAM_VIEW"
        | "TEAM_MANAGE"
        | "ROSTER_EDIT"
        | "COMPOSITION_EDIT"
        | "AUGUR_PATTERN_EDIT"
        | "QUIZ_QUESTION_EDIT"
        | "ROLE_MANAGE"
      )[];
      system: boolean;
    };
    RoleSummaryDto: {
      name: string;
      permissions: (
        | "SERVER_VIEW"
        | "SERVER_INFRA_VIEW"
        | "SERVER_START"
        | "SERVER_STOP"
        | "SERVER_CONTROL_ALL"
        | "SERVER_CREATE"
        | "SERVER_EDIT"
        | "SERVER_DELETE"
        | "PORT_VIEW"
        | "PORT_RULE_EDIT"
        | "DISCORD_CHANNEL_MANAGE"
        | "USER_VIEW"
        | "USER_ROLE_ASSIGN"
        | "INGEST_VIEW"
        | "INGEST_MANAGE"
        | "TEAM_CREATE"
        | "TEAM_VIEW"
        | "TEAM_MANAGE"
        | "ROSTER_EDIT"
        | "COMPOSITION_EDIT"
        | "AUGUR_PATTERN_EDIT"
        | "QUIZ_QUESTION_EDIT"
        | "ROLE_MANAGE"
      )[];
    };
    Row: {
      /** Format: int64 */
      seeds: number;
      tier: string;
      /** Format: int64 */
      tracked: number;
    };
    RuleOutcomeDto: {
      /** @enum {string} */
      outcome:
        "CREATED" | "OPENED" | "CLOSED" | "REROUTED" | "DELETED" | "UNCHANGED";
      rule: string;
    };
    SearchedPlayerDto: {
      collecting: boolean;
      gameName: string;
      known: boolean;
      /** Format: int64 */
      knownGames: number;
      masteries: components["schemas"]["MasteryDto"][];
      rankings: components["schemas"]["RankedStandingDto"][];
      slug: string;
      stats: components["schemas"]["MyStatsDto"];
      tagLine: string;
    };
    SeoCreatorsDto: {
      creators: string[];
      unknown: string[];
    };
    SessionSummariesDto: {
      free: boolean;
      planned: boolean;
    };
    SessionSummaryEmbedDto: {
      /** Format: int32 */
      color?: number | null;
      description?: string | null;
      fields: components["schemas"]["FieldDto"][];
      footer?: components["schemas"]["FooterDto"] | null;
      title: string;
      url?: string | null;
    };
    SessionSummaryTestDto: {
      detail: string | null;
      embeds: components["schemas"]["SessionSummaryEmbedDto"][] | null;
      /** @enum {string|null} */
      status: "SENT" | "UNREACHABLE" | "DISABLED" | "FAILED" | null;
    };
    SideRanksDto: {
      flex: components["schemas"]["AverageRankDto"] | null;
      solo: components["schemas"]["AverageRankDto"] | null;
    };
    StatComparisonDto: {
      /** Format: double */
      kdaDelta: number | null;
      /** Format: int64 */
      referenceGames: number;
      /** Format: double */
      winRateDelta: number | null;
    };
    /** @description Sur les parties d'Ã©quipe de la pÃ©riode seulement. Absente : aucune partie d'Ã©quipe. */
    StatLineDto: {
      /** Format: int64 */
      afkGames: number;
      /** Format: double */
      assistsPerGame: number | null;
      /** Format: double */
      controlWardsPlaced: number | null;
      /** Format: double */
      csDiffAt15: number | null;
      /** Format: double */
      csPerMinute: number | null;
      /** Format: double */
      damagePerMinute: number | null;
      /** Format: double */
      damageShare: number | null;
      /** Format: double */
      damageTakenPerMinute: number | null;
      /** Format: double */
      deathShare: number | null;
      /** Format: double */
      deathsPer10: number | null;
      /** Format: double */
      deathsPerGame: number | null;
      /** Format: double */
      epicMonsterDamagePerMinute: number | null;
      /** Format: date-time */
      firstPlayedAt: string | null;
      /** Format: int64 */
      games: number;
      /** Format: double */
      goldDiffAt15: number | null;
      /** Format: double */
      goldPerMinute: number | null;
      iconUrl: string | null;
      /** Format: double */
      kda: number | null;
      key: string;
      /** Format: double */
      killParticipation: number | null;
      /** Format: double */
      killsDiffAt15: number | null;
      /** Format: double */
      killsPerGame: number | null;
      label: string | null;
      /**
       * Format: int64
       * @description Parties oÃ¹ les Ã©carts Ã  15 min sont connus : celles dont on a la timeline.
       */
      laningGames: number;
      /** Format: date-time */
      lastPlayedAt: string | null;
      /** Format: double */
      platesDiff: number | null;
      /** Format: int64 */
      secondsPlayed: number;
      /** Format: double */
      timeDeadShare: number | null;
      /** Format: double */
      turretDamagePerMinute: number | null;
      /** Format: double */
      turretTakedowns: number | null;
      versusRest: components["schemas"]["StatComparisonDto"] | null;
      /** Format: double */
      visionPerMinute: number | null;
      /** Format: double */
      wardsKilledPerMinute: number | null;
      /** Format: double */
      winRate: number | null;
      /** Format: int64 */
      wins: number;
      /** Format: double */
      xpDiffAt15: number | null;
    };
    StaticPortRuleDto: {
      enabled: boolean;
      id: string | null;
      lanIp: string | null;
      /** Format: int32 */
      lanPort: number | null;
      name: string;
      proto: string;
      /** Format: int32 */
      wanPortEnd: number | null;
      /** Format: int32 */
      wanPortStart: number;
    };
    StaticPortRuleRequest: {
      enabled: boolean;
      lanIp?: string | null;
      /** Format: int32 */
      lanPort?: number | null;
      name: string;
      proto: string;
      /** Format: int32 */
      wanPortEnd?: number | null;
      /** Format: int32 */
      wanPortStart: number;
    };
    StatsCoverageDto: {
      /** Format: date-time */
      firstPlayedAt: string | null;
      /** Format: int64 */
      games: number;
      /** Format: int64 */
      knownMatches: number;
      /** Format: date-time */
      lastPlayedAt: string | null;
      /** Format: date-time */
      lastSyncAt: string | null;
      /** Format: int64 */
      pendingMatches: number;
      tracked: boolean;
    };
    StatsRefreshDto: {
      /** Format: date-time */
      nextAllowedAt: string | null;
      /** Format: int32 */
      playersQueued: number;
      triggered: boolean;
    };
    StrongSideDto: {
      /** Format: int32 */
      enemyGanks: number;
      /** Format: int32 */
      enemyGanksOnWeakSide: number;
      /** Format: int32 */
      games: number;
      /** @enum {string} */
      side: "TOP" | "BOT" | "BALANCED";
      /** Format: int32 */
      wins: number;
    };
    TeamDto: {
      /** Format: date-time */
      createdAt: string;
      id: string;
      /** Format: int32 */
      memberCount: number;
      members: components["schemas"]["TeamMemberDto"][];
      name: string;
      publicPage: boolean;
      trainingSlots: components["schemas"]["TrainingSlotDto"][] | null;
      /** Format: date-time */
      updatedAt: string;
      viewerCanEditCompositions: boolean;
      viewerCanEditRoster: boolean;
      viewerCanManage: boolean;
      viewerMemberId: string | null;
    };
    TeamEarlyGameDto: {
      /** Format: int32 */
      games: number;
      members: components["schemas"]["MemberEarlyDto"][];
      strongSides: components["schemas"]["StrongSideDto"][];
    };
    TeamGameDetailDto: {
      /** Format: int32 */
      days: number | null;
      early: components["schemas"]["EarlyGameDto"] | null;
      game: components["schemas"]["TeamGameDto"];
      matchups: components["schemas"]["MatchupDto"][];
      metrics: components["schemas"]["GamePlayerMetricsDto"][];
      /** Format: date-time */
      ranksObservedAt: string | null;
      teamId: string | null;
      timelineAvailable: boolean;
      viewerMemberId: string | null;
    };
    TeamGameDto: {
      allies: components["schemas"]["TeamGamePlayerDto"][];
      allyRanks: components["schemas"]["SideRanksDto"] | null;
      /** Format: int64 */
      durationSeconds: number;
      enemies: components["schemas"]["TeamGamePlayerDto"][];
      enemyRanks: components["schemas"]["SideRanksDto"] | null;
      matchId: string;
      patch: string | null;
      players: components["schemas"]["TeamGamePlayerDto"][];
      /** Format: int32 */
      presentPlayers: number;
      queue: string | null;
      /** Format: int32 */
      queueId: number;
      /** Format: date-time */
      ranksObservedAt: string | null;
      splitSides: boolean;
      /** Format: date-time */
      startedAt: string | null;
      win: boolean | null;
    };
    TeamGamePlayerDto: {
      afk: boolean;
      /** Format: int32 */
      assists: number;
      at15: components["schemas"]["At15Dto"] | null;
      /** Format: int32 */
      championId: number;
      championName: string | null;
      /** Format: int32 */
      damageTaken: number;
      /** Format: int32 */
      damageToChampions: number;
      /** Format: int32 */
      deaths: number;
      displayName: string | null;
      flexRank: components["schemas"]["RankedStandingDto"] | null;
      /** Format: int32 */
      goldEarned: number;
      iconUrl: string | null;
      /** Format: int32 */
      kills: number;
      memberId: string | null;
      /** Format: int32 */
      minionsKilled: number;
      position: string | null;
      riotId: string | null;
      /** Format: int32 */
      side: number;
      soloRank: components["schemas"]["RankedStandingDto"] | null;
      /** Format: int32 */
      visionScore: number;
      win: boolean;
    };
    TeamGamesStatsDto: {
      byPatch: components["schemas"]["TeamRecordDto"][];
      byQueue: components["schemas"]["TeamRecordDto"][];
      bySide: components["schemas"]["TeamRecordDto"][];
      /** Format: int32 */
      days: number | null;
      /** Format: date-time */
      firstPlayedAt: string | null;
      games: components["schemas"]["TeamGameDto"][];
      /** Format: date-time */
      generatedAt: string;
      /** Format: date-time */
      lastPlayedAt: string | null;
      /** Format: int32 */
      minimumPlayers: number;
      overall: components["schemas"]["TeamRecordDto"];
      presence: components["schemas"]["TeamMemberPresenceDto"][];
      /** Format: int32 */
      rosterSize: number;
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
      teamId: string;
      teamName: string;
      /** Format: int64 */
      totalGames: number;
      truncated: boolean;
      /** Format: int64 */
      undecidedGames: number;
      viewerMemberId: string | null;
    };
    TeamLevelDto: {
      /** Format: int32 */
      games: number;
      metrics: components["schemas"]["TeamLevelMetric"][];
      patches: string[];
      tier: string | null;
    };
    TeamLevelMetric: {
      /** Format: int32 */
      games: number;
      /** Format: int32 */
      gamesAtEnd: number;
      /** Format: double */
      inTier: number | null;
      key: string;
      level: string | null;
      /** Format: double */
      mean: number | null;
      /** Format: double */
      meanAtEnd: number | null;
      /** Format: double */
      meanChange: number | null;
      polarity: string | null;
    };
    TeamMemberDto: {
      avatarUrl: string | null;
      captain: boolean;
      coach: boolean;
      displayName: string;
      hiddenOnPublicPage: boolean;
      linked: boolean;
      memberId: string;
      riotGameName: string | null;
      riotTagLine: string | null;
      roles: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[];
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
    };
    TeamMemberPresenceDto: {
      displayName: string | null;
      /** Format: int64 */
      games: number;
      memberId: string;
      /** Format: double */
      presenceRate: number | null;
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
      /** Format: double */
      winRate: number | null;
      /** Format: int64 */
      wins: number;
    };
    TeamNameRequest: {
      name: string;
    };
    TeamOppositionDto: {
      byEnemyTier: components["schemas"]["TeamRecordDto"][];
      byGap: components["schemas"]["TeamRecordDto"][];
      byPosition: components["schemas"]["PositionOppositionDto"][];
      /** Format: int32 */
      ceilingMinimumGames: number;
      ceilingTier: string | null;
      /** Format: int32 */
      days: number | null;
      early: components["schemas"]["TeamEarlyGameDto"] | null;
      /** Format: int32 */
      games: number;
      /** Format: int32 */
      gamesWithRanks: number;
      /** Format: date-time */
      generatedAt: string;
      level: components["schemas"]["TeamLevelDto"] | null;
      /** Format: double */
      medianLagDays: number | null;
      /** @enum {string} */
      state:
        | "STATISTIQUES_CONNUES"
        | "COMPTE_RIOT_ABSENT"
        | "INGESTION_EN_COURS"
        | "AUCUNE_PARTIE"
        | "EFFECTIF_INCOMPLET"
        | "CONNECTEUR_INDISPONIBLE";
      teamId: string;
    };
    TeamPlayersStatsDto: {
      /** Format: int32 */
      championsPerPlayer: number;
      /** Format: int32 */
      days: number | null;
      /** Format: date-time */
      generatedAt: string;
      players: components["schemas"]["PlayerStatsDto"][];
      /**
       * Format: int64
       * @description Parties d'Ã©quipe de la pÃ©riode (au moins premadeMinimum membres). Absente : inconnue.
       */
      premadeGames: number | null;
      /** Format: int32 */
      premadeMinimum: number;
      teamId: string;
      teamName: string;
      viewerMemberId: string | null;
    };
    TeamRecordDto: {
      /** Format: double */
      averageDurationSeconds: number | null;
      /** Format: int64 */
      games: number;
      key: string;
      label: string | null;
      /** Format: int64 */
      losses: number;
      /** Format: double */
      winRate: number | null;
      /** Format: int64 */
      wins: number;
    };
    TeamSessionDto: {
      /** Format: date */
      day: string;
      /** Format: date-time */
      detectedAt: string;
      /** Format: date-time */
      endedAt: string;
      /** Format: int64 */
      games: number;
      id: string;
      matchIds: string[];
      memberIds: string[];
      missed: boolean;
      planned: boolean;
      slotId: string | null;
      /** Format: date-time */
      startedAt: string;
      teamId: string;
      /** Format: int64 */
      wins: number;
    };
    TeamSummaryDto: {
      /** Format: date-time */
      createdAt: string;
      id: string;
      /** Format: int32 */
      memberCount: number;
      name: string;
      /** Format: date-time */
      updatedAt: string;
      viewerCanEditCompositions: boolean;
      viewerCanEditRoster: boolean;
      viewerCanManage: boolean;
      viewerMemberId: string | null;
    };
    TeamSynergyDto: {
      duos: components["schemas"]["Duo"][];
      /** Format: int64 */
      games: number;
      /** Format: int32 */
      minimumDuoGames: number;
      resources: components["schemas"]["Resource"][];
    };
    Tier: {
      /** Format: int64 */
      count: number;
      values: number[];
    };
    TierComboChampion: {
      iconUrl: string | null;
      /** Format: int32 */
      id: number;
      key: string | null;
      name: string | null;
    };
    TierCombosDto: {
      combos: components["schemas"]["Line"][];
      /** Format: date-time */
      computedAt: string;
      /** Format: int64 */
      games: number;
      kind: string;
      /** Format: int32 */
      minGames: number;
      positions: string[];
      tier: string;
    };
    TrainingSlotDto: {
      date: string | null;
      /** @enum {string|null} */
      day:
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY"
        | null;
      end: string;
      id: string | null;
      start: string;
    };
    UpdateMemberRequest: {
      coach: boolean;
      roles: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[];
      /** @enum {string} */
      status: "TITULAIRE" | "REMPLACANT" | "COACH";
    };
    UserDto: {
      avatarUrl: string | null;
      /** Format: date-time */
      createdAt: string | null;
      discordId: string | null;
      discordUsername: string | null;
      displayName: string | null;
      id: string;
      /** Format: date-time */
      lastLoginAt: string | null;
      links: components["schemas"]["AccountLinksDto"];
      riotGameName: string | null;
      riotTagLine: string | null;
      roleId: string | null;
      roleName: string | null;
    };
    UserIdentityDto: {
      permissions: (
        | "SERVER_VIEW"
        | "SERVER_INFRA_VIEW"
        | "SERVER_START"
        | "SERVER_STOP"
        | "SERVER_CONTROL_ALL"
        | "SERVER_CREATE"
        | "SERVER_EDIT"
        | "SERVER_DELETE"
        | "PORT_VIEW"
        | "PORT_RULE_EDIT"
        | "DISCORD_CHANNEL_MANAGE"
        | "USER_VIEW"
        | "USER_ROLE_ASSIGN"
        | "INGEST_VIEW"
        | "INGEST_MANAGE"
        | "TEAM_CREATE"
        | "TEAM_VIEW"
        | "TEAM_MANAGE"
        | "ROSTER_EDIT"
        | "COMPOSITION_EDIT"
        | "AUGUR_PATTERN_EDIT"
        | "QUIZ_QUESTION_EDIT"
        | "ROLE_MANAGE"
      )[];
      user: components["schemas"]["UserDto"];
    };
    UserStatsDto: {
      active: components["schemas"]["Active"];
      activeByApp: {
        [key: string]: components["schemas"]["Active"];
      };
      daily: components["schemas"]["Day"][];
      /** Format: int64 */
      riotLinked: number;
      /** Format: int64 */
      total: number;
    };
    VisibilityRequest: {
      value: boolean;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  list_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PatternDto"][];
        };
      };
    };
  };
  draft: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PatternRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PatternDto"];
        };
      };
    };
  };
  rollback: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        key: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CommentRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PatternDto"];
        };
      };
    };
  };
  history: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        key: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PatternDto"][];
        };
      };
    };
  };
  activate: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        key: string;
        version: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CommentRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PatternDto"];
        };
      };
    };
  };
  impact: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        key: string;
        version: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ImpactDto"];
        };
      };
    };
  };
  all_5: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PortainerStackDto"][];
        };
      };
    };
  };
  all_4: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": (string &
            (
              | components["schemas"]["GameServerDto"]
              | components["schemas"]["GameServerMemberDto"]
            ))[];
        };
      };
    };
  };
  create_3: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["GameServerDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["GameServerDto"];
        };
      };
    };
  };
  games_2: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["GameDto"][];
        };
      };
    };
  };
  publicStatus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PublicServerStatusDto"][];
        };
      };
    };
  };
  byId_3: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*":
            | components["schemas"]["GameServerDto"]
            | components["schemas"]["GameServerMemberDto"];
        };
      };
    };
  };
  update_3: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["GameServerDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["GameServerDto"];
        };
      };
    };
  };
  start: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  stop: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  accountsByRank: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["AccountsByRankDto"];
        };
      };
    };
  };
  crawler: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CrawlerDto"];
        };
      };
    };
  };
  toggleCrawler: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CrawlerToggleRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CrawlerDto"];
        };
      };
    };
  };
  updateHistoryWindow: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["HistoryWindowDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["HistoryWindowDto"];
        };
      };
    };
  };
  load: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["IngestLoadDto"];
        };
      };
    };
  };
  pause: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["IngestPauseDto"];
        };
      };
    };
  };
  updatePause: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["IngestPauseRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["IngestPauseDto"];
        };
      };
    };
  };
  inventory: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RiotDataInventoryDto"];
        };
      };
    };
  };
  invalidate: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RiotDataInvalidationRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RiotDataInvalidationDto"];
        };
      };
    };
  };
  seoCreators: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["SeoCreatorsDto"];
        };
      };
    };
  };
  replaceSeoCreators: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": string[];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["SeoCreatorsDto"];
        };
      };
    };
  };
  summary: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["IngestSummaryDto"];
        };
      };
    };
  };
  champion: {
    parameters: {
      query: {
        tier: string;
      };
      header?: never;
      path: {
        championId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ChampionGridDto"];
        };
      };
    };
  };
  grid: {
    parameters: {
      query?: {
        scope?: string;
        tier?: string;
        patch?: string;
      };
      header?: never;
      path: {
        position: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ReferenceGridDto"];
        };
      };
    };
  };
  me: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MeDto"];
        };
      };
    };
  };
  changeDisplayName: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["DisplayNameRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MeDto"];
        };
      };
    };
  };
  changeSessionSummaries: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SessionSummariesDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MeDto"];
        };
      };
    };
  };
  sessionSummary: {
    parameters: {
      query: {
        day: string;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": {
            [key: string]: Record<string, never>;
          };
        };
      };
    };
  };
  mine_1: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        champions?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MyStatsDto"];
        };
      };
    };
  };
  findings_2: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["FindingDto"][];
        };
      };
    };
  };
  games_1: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        limit?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MyGamesDto"];
        };
      };
    };
  };
  game_2: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        matchId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamGameDetailDto"];
        };
      };
    };
  };
  gameFindings_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        matchId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["FindingDto"][];
        };
      };
    };
  };
  historyWindow: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["HistoryWindowDto"];
        };
      };
    };
  };
  indexable: {
    parameters: {
      query?: {
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["IndexablePlayerDto"][];
        };
      };
    };
  };
  search: {
    parameters: {
      query: {
        q: string;
        limit?: number;
      };
      header?: {
        "X-Visitor"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PlayerSuggestionDto"][];
        };
      };
    };
  };
  page: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        champions?: number;
        light?: boolean;
        masteries?: boolean;
      };
      header?: never;
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["SearchedPlayerDto"];
        };
      };
    };
  };
  collect: {
    parameters: {
      query?: never;
      header?: {
        "X-Visitor-Id"?: string;
      };
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PlayerCollectDto"];
        };
      };
    };
  };
  companions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompanionsDto"];
        };
      };
    };
  };
  findings_1: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: never;
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["FindingDto"][];
        };
      };
    };
  };
  games: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        limit?: number;
      };
      header?: never;
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["MyGamesDto"];
        };
      };
    };
  };
  game_1: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: never;
      path: {
        riotId: string;
        matchId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamGameDetailDto"];
        };
      };
    };
  };
  gameFindings: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        riotId: string;
        matchId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["FindingDto"][];
        };
      };
    };
  };
  trace: {
    parameters: {
      query?: {
        matchId?: string;
        days?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        riotId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["EvaluationDto"][];
        };
      };
    };
  };
  reconcile: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PortForwardingReportDto"];
        };
      };
    };
  };
  listRules: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PortRuleDto"][];
        };
      };
    };
  };
  listStaticRules: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["StaticPortRuleDto"][];
        };
      };
    };
  };
  createStaticRule: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["StaticPortRuleRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["StaticPortRuleDto"];
        };
      };
    };
  };
  deleteStaticRule: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  status: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": {
            [key: string]: Record<string, never>;
          };
        };
      };
    };
  };
  recent: {
    parameters: {
      query?: {
        days?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RecentSessionDto"][];
        };
      };
    };
  };
  send: {
    parameters: {
      query: {
        day: string;
        send?: boolean;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["SessionSummaryTestDto"];
        };
      };
    };
  };
  get: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PremadeLabSettingsDto"];
        };
      };
    };
  };
  update_2: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PremadeLabSettingsDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PremadeLabSettingsDto"];
        };
      };
    };
  };
  listed: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["Listed"][];
        };
      };
    };
  };
  byId_2: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["PublicTeamDto"];
        };
      };
    };
  };
  active: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["QuizQuestionDto"][];
        };
      };
    };
  };
  all_3: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["QuizQuestionDto"][];
        };
      };
    };
  };
  save: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["QuizQuestionRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["QuizQuestionDto"];
        };
      };
    };
  };
  delete_3: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  all_2: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RoleDto"][];
        };
      };
    };
  };
  create_2: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RoleDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RoleDto"];
        };
      };
    };
  };
  update_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RoleDto"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RoleDto"];
        };
      };
    };
  };
  delete_2: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  mine: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamSummaryDto"][];
        };
      };
    };
  };
  create: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TeamNameRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  claim: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamSummaryDto"][];
        };
      };
    };
  };
  byId: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  rename: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TeamNameRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  delete: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  byTeam: {
    parameters: {
      query?: {
        masteryFloor?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ChampionPoolDto"];
        };
      };
    };
  };
  setMasteryFloor: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PoolMasteryFloorRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ChampionPoolDto"];
        };
      };
    };
  };
  setChampions: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        role: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PoolChampionsRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["ChampionPoolDto"];
        };
      };
    };
  };
  all_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompositionDto"][];
        };
      };
    };
  };
  create_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CompositionRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompositionDto"];
        };
      };
    };
  };
  byId_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        compositionId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompositionDto"];
        };
      };
    };
  };
  update: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        compositionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CompositionRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompositionDto"];
        };
      };
    };
  };
  delete_1: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        compositionId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  addMember: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AddMemberRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  updateMember: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        memberId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateMemberRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  removeMember: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        memberId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  setMemberHidden: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        memberId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["VisibilityRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  setPublic: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["VisibilityRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  list: {
    parameters: {
      query?: {
        days?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamSessionDto"][];
        };
      };
    };
  };
  detect: {
    parameters: {
      query: {
        day: string;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamSessionDto"][];
        };
      };
    };
  };
  compositions: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["CompositionRecordDto"][];
        };
      };
    };
  };
  draft_1: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["DraftAdviceDto"];
        };
      };
    };
  };
  findings: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["FindingDto"][];
        };
      };
    };
  };
  game: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
        matchId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamGameDetailDto"];
        };
      };
    };
  };
  opposition: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamOppositionDto"];
        };
      };
    };
  };
  players: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        champions?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamPlayersStatsDto"];
        };
      };
    };
  };
  refreshStatus: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["StatsRefreshDto"];
        };
      };
    };
  };
  refresh: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["StatsRefreshDto"];
        };
      };
    };
  };
  synergy: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamSynergyDto"];
        };
      };
    };
  };
  team: {
    parameters: {
      query?: {
        days?: number;
        patches?: number;
        limit?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamGamesStatsDto"];
        };
      };
    };
  };
  setTrainingSlots: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TrainingSlotDto"][];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TeamDto"];
        };
      };
    };
  };
  of: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tier: string;
        kind: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["TierCombosDto"];
        };
      };
    };
  };
  all: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["UserDto"][];
        };
      };
    };
  };
  byDiscordId: {
    parameters: {
      query?: {
        discordUsername?: string;
        avatarUrl?: string;
      };
      header?: never;
      path: {
        discordId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["UserIdentityDto"];
        };
      };
    };
  };
  effectivePermissions: {
    parameters: {
      query?: {
        discordUsername?: string;
      };
      header?: never;
      path: {
        discordId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": (
            | "SERVER_VIEW"
            | "SERVER_INFRA_VIEW"
            | "SERVER_START"
            | "SERVER_STOP"
            | "SERVER_CONTROL_ALL"
            | "SERVER_CREATE"
            | "SERVER_EDIT"
            | "SERVER_DELETE"
            | "PORT_VIEW"
            | "PORT_RULE_EDIT"
            | "DISCORD_CHANNEL_MANAGE"
            | "USER_VIEW"
            | "USER_ROLE_ASSIGN"
            | "INGEST_VIEW"
            | "INGEST_MANAGE"
            | "TEAM_CREATE"
            | "TEAM_VIEW"
            | "TEAM_MANAGE"
            | "ROSTER_EDIT"
            | "COMPOSITION_EDIT"
            | "AUGUR_PATTERN_EDIT"
            | "QUIZ_QUESTION_EDIT"
            | "ROLE_MANAGE"
          )[];
        };
      };
    };
  };
  myRiotAccount: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RiotAccountDto"];
        };
      };
    };
  };
  linkMyRiotAccount: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RiotAccountRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RiotAccountDto"];
        };
      };
    };
  };
  suggestRiotAccounts: {
    parameters: {
      query: {
        q: string;
        limit?: number;
      };
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["RiotAccountSuggestionDto"][];
        };
      };
    };
  };
  stats: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["UserStatsDto"];
        };
      };
    };
  };
  activity: {
    parameters: {
      query: {
        app: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  identity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["UserIdentityDto"];
        };
      };
    };
  };
  assignRole: {
    parameters: {
      query?: never;
      header?: {
        "X-Actor-Id"?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AssignRoleRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "*/*": components["schemas"]["UserDto"];
        };
      };
    };
  };
}
