Feature: Landing
  As a visitor
  I want to open ChairLab without logging in
  So that I can start configuring a chair

  Scenario: Visitor opens the home page
    Given I open the home page
    Then I see the "ChairLab" heading
