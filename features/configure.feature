Feature: Configure and share a chair
  As a visitor
  I want to build a chair and share it
  So that someone else opens exactly my build

  Scenario: Build a chair, share it, and reopen it from the short link
    Given I open the home page
    Then the total is "₱12,999"
    When I choose "Crimson" for "Frame"
    And I choose "Premium Leather" for "Upholstery"
    And I choose "Pro · Volt" for "Stitching"
    And I choose "Racing Aluminum" for "Base"
    And I turn on "RGB strip"
    And I choose "Magenta" for "RGB color"
    Then the total is "₱17,799"
    When I copy the share link
    Then I am told "Short link copied"
    When I open the copied link in a new tab
    Then the page address is a short link
    And the total is "₱17,799"
    And "Crimson" is selected for "Frame"
    And "Magenta" is selected for "RGB color"
    And "RGB strip" is on
