// import playwright modules
const { test, expect } = require('@playwright/test');

// test cases to be run
const testCases = [
  {
    "id": 1,
    "name": "Test Case 1",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Draft project brief",
  },
  {
    "id": 2,
    "name": "Test Case 2",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Schedule kickoff meeting",
  },
  {
    "id": 3,
    "name": "Test Case 3",
    "leftNav": "Cross-functional project plan, Project",
    "column": "To do",
    "card_title": "Share timeline with teammates",
  },
  {
    "id": 4,
    "name": "Test Case 4",
    "leftNav": "Work Requests",
    "column": "New Requests",
    "card_title": "[Example] Laptop setup for new hire",
  },
  {
    "id": 5,
    "name": "Test Case 5",
    "leftNav": "Work Requests",
    "column": "In Progress",
    "card_title": "[Example] Password not working",
  },
  {
    "id": 6,
    "name": "Test Case 6",
    "leftNav": "Work Requests",
    "column": "Completed",
    "card_title": "[Example] New keycard for Daniela V",
  }
];
// test functions
test.describe('Asana Data-Driven Tests', () => {
  testCases.forEach((data) => {
    // ensure name field in test cases is referenced. This will not affect the login scenario but will affect the projects selection later
    // will also ensure we are running all test cases as this is async
    test(data.name, async ({ page }) => {
      await test.step('Login to Asana', async () => {
        // Login to Asana
        await page.goto('https://app.asana.com/-/login')
        // Wait for the email input field to load
        await page.waitForSelector('input[name="e"]')
        // Enter valid email address 
        await page.fill('input[name="e"]','ben+pose@workwithloop.com')
        // Click continue button via '.' class selector ::note there are two similar buttons in the dom for google and continue this is a potential issue
        await page.click('.LoginEmailForm-continueButton')
        //Wait for the password input field to load in on the DOM
        await page.waitForSelector('input[name="p"]')
        // enter the desired password & should add an assert to see if data entered the password field? 
        await page.fill('input[name="p"]','Password123')
        //click the login button 
        await page.click('.LoginPasswordForm-loginButton')
      });
        // Navigate to the project page
      await test.step('Navigate to the project page', async () => {
        //sidebar element holding the relevant project links
        const project_sidebar = '.SidebarProjectsSectionProjectList-projects';
        // wait for the selector to find the element variable in the DOM
        await page.waitForSelector(project_sidebar)
       //gets all links underneath the projects sidebar element with $$
       const project_sidebar_links = await page.$$(project_sidebar + ' a')
       // iterate through the the projects listed
          for (const link of project_sidebar_links){
            //compare link text to data.leftNav
            const link_text = await link.innerText()
            if (link_text === data.leftNav){
              // if text matches click link
              await link.click()
            }
          }
      });
      await test.step('Verify the card is within the right column', async () => {
        await page.waitForSelector('.BoardColumn.BoardBody-column');
        const kanban_board_columns = await page.$$('.BoardColumn.BoardBody-column');
        for (const column of kanban_board_columns){
          const column_title = await column.$('h3')
          if (column_title){
            let column_title_text = await column_title.innerText()
            console.log('this is the column title result ' + column_title_text);
            const column_title_text_space_converted = column_title_text.replace(/\u00A0/g, ' ');
            if (column_title_text_space_converted === data.column){
              let task_names = [];
              const board_cards = await column.$$('.BoardCardLayout.BoardCard-layout');
              for (const card of board_cards) {
                // look at all the task names
                const task_name_span = await card.$('.BoardCard-taskName');
                if (task_name_span) {
                  const task_name_text= await task_name_span.innerText();
                  // add the task name to the list
                  task_names.push(task_name_text)
                }
              }
              // assert the task name is in the list
              expect(task_names).toContain(data.card_title);
            }
          }
        }
      });
    });
  });
});