# Workflows
## Git, Linux and Julia
The related tutorials are in the book [Scientific Computing for Physicists](https://book.jinguo-group.science). The following are the links to the tutorials:
- [How to use Linux](https://book.jinguo-group.science/stable/chap1/terminal/)
- [How to use Git](https://book.jinguo-group.science/stable/chap1/git/)
- [Julia Installation Guide](https://book.jinguo-group.science/stable/chap2/julia-setup/)

## GitHub Copilot + Markdown for technical writing

This is a workflow for setting up AI-assisted technical writing using Github Copilot and Markdown.

#### Step 1: Go to the [GitHub website](https://github.com/) and sign up for a free account.
#### Step 2: Get Visual Studio Code Editor
1. Go to [VS Code website](https://code.visualstudio.com/) and download the latest version.
2. Install & open VS Code.
3. Add the following VS Code extensions. To add an VS Code extension, please click the `Extensions` button in the left side bar, search for the extension name and click the `Install` button.
    - [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced)
    - [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
5. Create a new file and save it as `test.md`. Then, click the `Preview` button ![](image-2.png){width=20px} in the top right corner.
1. Edit the markdown file. You can learn markdown from [here](https://www.markdownguide.org/basic-syntax/). Math equations can also be rendered. For example, the following code
    ~~~
    $$
    \frac{1}{2}
    $$
    ~~~
    will be rendered as
    ```math
    \frac{1}{2}
    ```

2. Install the following VS Code extension
   - [Github Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot). It requires you to connect with your Github account, and you can use it for free for 30 days. After 30 days, you can still use it for free but you need to join the waitlist. You can also use it for free if you are a student. You can apply for a student account [here](https://education.github.com/pack). Please check this [YouTube video](https://youtu.be/HDG4PQK7DK8?si=sOR7PqNcGAnrV4Tm) for more details
3.  You might need to activate the Github Copilot extension by clicking the `Activate` (![](image.png){width=20px}) button in the bottom right corner of the VS Code window to make it work. Then you can type some text in the editor and press `Tab` to generate lecture notes.
#### Step 3: Using Github to sync your files (optional)
If you want to sync your files across different devices, you can use Github. Github is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere. You can use Github to host your markdown files and provide preview.

This tutorial does not cover how to use Github. You can learn it from the [YouTube video](https://www.youtube.com/watch?v=RGOj5yH7evk) or the [official guide](https://guides.github.com/activities/hello-world/).